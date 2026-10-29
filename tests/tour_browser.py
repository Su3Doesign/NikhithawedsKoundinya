"""Browser regressions for uninterrupted auto-read and temporary away/return holds.

Serve the repository, then run:
    python tests/tour_browser.py --url http://127.0.0.1:8002
Requires Python Playwright and Chromium; no production dependencies are added.
Headless Chromium does not hide background tabs, so lifecycle events are
dispatched explicitly. Navigation, controls, audio and page turns remain real.
"""
import argparse
import json
import time
from contextlib import contextmanager
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:8002')
parser.add_argument('--chromium', default='/usr/bin/chromium')
args = parser.parse_args()
checks = []
errors = []


def check(ok, message):
    checks.append(message)
    assert ok, message


def until(page, expression):
    deadline = time.monotonic() + 10
    while not page.evaluate(expression):
        assert time.monotonic() < deadline, expression
        page.wait_for_timeout(30)


def turn_done(page):
    until(page, '!document.getElementById("nextPage").disabled')


def chapter(page, name):
    value = page.locator('#chapterSelect option').evaluate_all(
        '(options, name) => options.find(o => o.textContent.includes(name)).value', name)
    page.locator('#chapterSelect').select_option(value)
    turn_done(page)


def hidden(page, value):
    page.evaluate('''value => {
      window.testHidden = value;
      document.dispatchEvent(new Event('visibilitychange'));
    }''', value)


@contextmanager
def opened(browser, path='/', reduced=False, initially_hidden=False):
    context = browser.new_context(viewport={'width':390, 'height':844},
                                  has_touch=True, is_mobile=True,
                                  reduced_motion='reduce' if reduced else 'no-preference')
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    # Typography is unchanged by this patch; do not depend on a font CDN in timing tests.
    page.route('https://fonts.googleapis.com/**', lambda route: route.abort())
    page.route('https://fonts.gstatic.com/**', lambda route: route.abort())
    page.add_init_script('''
      const nativeHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden').get;
      window.testHidden = null;
      Object.defineProperty(document, 'hidden', {get() {
        return window.testHidden === null ? nativeHidden.call(document) : window.testHidden;
      }});
    ''' + ('window.testHidden = true;' if initially_hidden else ''))
    page.clock.install()
    page.goto(args.url.rstrip('/') + path, wait_until='load')
    page.wait_for_timeout(150)
    page.clock.pause_at(page.evaluate('Date.now()'))
    try:
        yield page
    finally:
        context.close()


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.chromium, args=[
        '--no-sandbox', '--autoplay-policy=no-user-gesture-required'])

    with opened(browser) as page:
        check(page.evaluate('AutoScroll.isOn()'), 'book starts automatically')
        page.locator('#nextPage').tap(); turn_done(page)
        check(page.evaluate('Book.currentId() === "couple" && AutoScroll.isOn()'),
              'Next keeps automatic page turning enabled')
        page.locator('#previousPage').tap(); turn_done(page)
        check(page.evaluate('Book.currentId() === "top" && AutoScroll.isOn()'),
              'Previous keeps automatic page turning enabled')
        page.clock.run_for(6000)
        check(page.evaluate('Book.currentId() === "top"'), 'a manually selected page gets reading time')
        page.clock.run_for(1600); turn_done(page)
        check(page.evaluate('Book.currentId() === "couple"'), 'auto-read actually advances after Previous')

        chapter(page, 'Your blessings')
        page.clock.run_for(3000)
        page.locator('#akBtn').tap()
        check('received' in page.locator('#akN').inner_text(), 'blessing interaction still works')
        page.clock.run_for(3000)
        page.locator('#akBtn').tap()
        page.locator('#music').tap()
        check(page.evaluate('AutoScroll.isOn()'), 'blessings and music leave the reading timer running')
        page.clock.run_for(4900); turn_done(page)
        check(page.evaluate('Book.currentId() === "end"'), 'interactions do not reset or delay the page timer')
        page.locator('#end .back').tap(); turn_done(page)
        check(page.evaluate('Book.currentId() === "top" && AutoScroll.isOn()'), 'internal links preserve auto-read')
        chapter(page, 'When & where')
        check(page.evaluate('AutoScroll.isOn()'), 'chapter selection preserves auto-read')

        page.locator('.is-current .page-content').focus()
        for key in ['Escape', 'ArrowDown', 'PageDown', 'Space']:
            page.keyboard.press(key)
            check(page.evaluate('AutoScroll.isOn()'), key + ' does not turn off auto-read')
        page.mouse.wheel(0, 300)
        check(page.evaluate('AutoScroll.isOn()'), 'wheel does not turn off auto-read')
        page.keyboard.press('ArrowRight'); turn_done(page)
        check(page.evaluate('Book.currentId() === "events" && AutoScroll.isOn()'), 'keyboard page navigation continues')

        page.locator('#autoScroll').tap()
        page.locator('#nextPage').tap(); turn_done(page)
        page.clock.run_for(30000)
        check(page.evaluate('Book.currentId() === "knots" && !AutoScroll.isOn()'),
              'only the Pause button stops automatic turns, including after manual navigation')
        hidden(page, True); page.clock.run_for(60000); hidden(page, False)
        page.clock.run_for(20000)
        check(page.evaluate('Book.currentId() === "knots" && !AutoScroll.isOn()'), 'explicit Pause survives away and return')
        page.locator('#autoScroll').tap(); page.clock.run_for(13000); turn_done(page)
        check(page.evaluate('Book.currentId() === "saptapadi" && AutoScroll.isOn()'), 'the same control resumes page turning')
        print('Book navigation, interactive blessings and explicit Pause passed', flush=True)

    with opened(browser, '/#couple') as page:
        page.locator('.is-current .scene-replay').tap()
        progress = page.evaluate('Book.progress()')
        page.clock.run_for(3000)
        check(page.evaluate('Book.progress()') == progress, 'scene pause still controls the artwork')
        check(page.evaluate('AutoScroll.isOn()'), 'scene pause does not pause the tour')
        page.clock.run_for(7000); turn_done(page)
        check(page.evaluate('Book.currentId() === "letter"'), 'a paused scene cannot block the next automatic page')
        chapter(page, 'Nikhitha & Sai Koundinya')
        page.clock.run_for(8200)
        check(page.locator('.is-current .scene-replay').inner_text() == 'Replay scene', 'scene completes before page turn')
        page.locator('.is-current .scene-replay').tap(); page.clock.run_for(1400); turn_done(page)
        check(page.evaluate('Book.currentId() === "letter"'), 'replaying a scene does not restart the page timer')
        page.emulate_media(reduced_motion='reduce')
        check(page.evaluate('AutoScroll.isOn()'), 'changing motion preference does not disable auto-read')
        print('Scene interactions retain the selected tour pace', flush=True)

    with opened(browser, '/#couple') as page:
        page.clock.run_for(2000)
        until(page, 'Music.isOn()')
        for leave, back, name in [
            (lambda: hidden(page, True), lambda: hidden(page, False), 'hidden tab'),
            (lambda: page.evaluate("window.dispatchEvent(new Event('blur'))"),
             lambda: page.evaluate("window.dispatchEvent(new Event('focus'))"), 'another window or app'),
            (lambda: page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide', {persisted:true}))"),
             lambda: page.evaluate("window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted:true}))"), 'browser back/forward cache'),
        ]:
            leave(); progress = page.evaluate('Book.progress()')
            page.clock.run_for(60000)
            check(page.evaluate('Book.currentId() === "couple"') and page.evaluate('Book.progress()') == progress,
                  name + ': no scene progress or page skipping while away')
            check(page.evaluate('AutoScroll.isOn() && !Music.isOn()'), name + ': intent retained and music held')
            back(); until(page, 'Music.isOn()'); page.clock.run_for(300)
            check(page.evaluate('Book.progress()') > progress, name + ': scene and music resume without another tap')
        page.clock.run_for(4000)
        check(page.evaluate('Book.currentId() === "couple"'), 'time away is not charged to the reading timer')
        page.clock.run_for(3000); turn_done(page)
        check(page.evaluate('Book.currentId() === "letter"'), 'automatic next page happens after remaining reading time')

        page.locator('#nextPage').tap()
        page.wait_for_timeout(250)
        hidden(page, True)
        animation_time = page.evaluate('''async () => {
          const animation = document.querySelector('.is-turning').getAnimations()[0];
          await animation.ready;
          return animation.currentTime;
        }''')
        page.wait_for_timeout(1400); page.clock.run_for(30000)
        check(page.locator('#nextPage').is_disabled(), 'an unfinished paper turn waits while away')
        now = page.evaluate('document.querySelector(".is-turning").getAnimations()[0].currentTime')
        check(abs(now - animation_time) < 2, 'paper-turn animation itself is frozen')
        hidden(page, False); turn_done(page)
        check(page.evaluate('Book.currentId() === "letter-en" && AutoScroll.isOn()'), 'paper turn resumes when returning')
        page.locator('#nextPage').tap(); turn_done(page)

        page.context.route('https://maps.app.goo.gl/**', lambda route: route.fulfill(
            status=200, content_type='text/html', body='<title>Directions test</title>'))
        with page.expect_popup() as popup_info:
            page.locator('#mapLink').tap()
        popup = popup_info.value
        check(page.evaluate('AutoScroll.isOn()'), 'actual Directions link does not switch off auto-read')
        hidden(page, True); page.clock.run_for(60000)
        check(page.evaluate('Book.currentId() === "when"'), 'directions visit does not advance pages in background')
        popup.close(); hidden(page, False); page.clock.run_for(12000); turn_done(page)
        check(page.evaluate('Book.currentId() === "events"'), 'returning from Directions continues automatically')

        page.locator('#music').tap()
        hidden(page, True); hidden(page, False)
        page.wait_for_timeout(150)
        check(page.evaluate('!Music.isOn() && AutoScroll.isOn()'), 'explicit music pause survives return independently')
        print('Away/return, link visit, page-turn suspension and music passed', flush=True)

    with opened(browser, '/#couple') as page:
        session = page.context.new_cdp_session(page)
        session.send('Input.dispatchTouchEvent', {'type':'touchStart', 'touchPoints':[{'x':285, 'y':400}]})
        for x in [250, 215, 180, 145, 110]:
            session.send('Input.dispatchTouchEvent', {'type':'touchMove', 'touchPoints':[{'x':x, 'y':400}]})
        session.send('Input.dispatchTouchEvent', {'type':'touchEnd', 'touchPoints':[]})
        turn_done(page)
        check(page.evaluate('Book.currentId() === "letter" && AutoScroll.isOn()'), 'real touch swipe preserves auto-read')
        session.detach()
        page.locator('#autoScrollSpeed').select_option('2')
        page.clock.run_for(10300); turn_done(page)
        check(page.evaluate('Book.currentId() === "letter-en"'), 'speed selection still governs the following page turn')

    with opened(browser, '/', reduced=True) as page:
        chapter(page, 'A beautiful beginning'); page.clock.run_for(9000)
        check(page.locator('#autoScrollLabel').text_content() == 'Read again', 'last page completes cleanly')
        page.locator('#previousPage').tap(); page.clock.run_for(11000)
        check(page.evaluate('Book.currentId() === "end" && AutoScroll.isOn()'), 'Previous after completion continues auto-read')
        page.clock.run_for(9000); page.locator('#autoScroll').tap()
        check(page.evaluate('Book.currentId() === "top" && AutoScroll.isOn()'), 'Read again restarts the tour')

    with opened(browser, '/scroll.html') as page:
        start = page.evaluate('scrollY'); page.clock.run_for(1000)
        check(100 <= page.evaluate('scrollY') - start <= 140, 'scroll starts at the configured 1x pace')
        page.mouse.wheel(0, 350); page.wait_for_timeout(200)
        page.keyboard.press('Escape')
        page.evaluate('window.scrollTo(0, 2500)'); page.wait_for_timeout(50)
        check(page.evaluate('AutoScroll.isOn()'), 'wheel, keys and manual scrolling do not disable auto-scroll')
        start = page.evaluate('scrollY'); page.clock.run_for(1000)
        check(100 <= page.evaluate('scrollY') - start <= 140, 'scroll continues from the new position at the same pace')
        page.evaluate("location.hash = '#when'"); page.wait_for_timeout(100)
        start = page.evaluate('scrollY'); page.clock.run_for(500)
        check(page.evaluate('AutoScroll.isOn()') and page.evaluate('scrollY') > start + 40, 'anchor navigation continues scrolling')
        hidden(page, True); start = page.evaluate('scrollY'); page.clock.run_for(60000)
        check(page.evaluate('scrollY') == start, 'scroll position does not move while away')
        hidden(page, False); page.clock.run_for(500)
        check(40 <= page.evaluate('scrollY') - start <= 75, 'scroll resumes without jumping ahead')
        page.locator('#autoScroll').tap(); start = page.evaluate('scrollY')
        hidden(page, True); hidden(page, False); page.clock.run_for(10000)
        check(page.evaluate('scrollY') == start and not page.evaluate('AutoScroll.isOn()'), 'explicit scroll Pause stays paused')
        page.locator('#autoScroll').tap(); page.clock.run_for(500)
        check(page.evaluate('scrollY') > start, 'scroll Resume works')
        page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); page.clock.run_for(500)
        check(page.locator('#autoScrollLabel').text_content() == 'Replay', 'scroll tour completes at the end')
        page.locator('#autoScroll').tap(); page.clock.run_for(500)
        check(page.evaluate('scrollY < 100 && AutoScroll.isOn()'), 'scroll Replay starts again')
        print('Scroll controls, manual navigation and return behavior passed', flush=True)

    for path in ['/', '/scroll.html']:
        with opened(browser, path, initially_hidden=True) as page:
            page.clock.run_for(30000)
            check(page.evaluate('!AutoScroll.isOn() && !Music.isOn()'), path + ': initially hidden page waits')
            hidden(page, False); until(page, 'Music.isOn()'); page.clock.run_for(500)
            check(page.evaluate('AutoScroll.isOn()'), path + ': first visibility starts the tour and music')
    browser.close()

    blocked = p.chromium.launch(executable_path=args.chromium, args=[
        '--no-sandbox', '--autoplay-policy=user-gesture-required'])
    for path in ['/', '/scroll.html']:
        with opened(blocked, path) as page:
            until(page, '!Music.isPending()')
            check(page.evaluate('!Music.isOn() && AutoScroll.isOn()'), path + ': autoplay policy does not stop the tour')
            page.touchscreen.tap(190, 310); until(page, 'Music.isOn()')
            check(page.evaluate('AutoScroll.isOn()'), path + ': first tap starts music without stopping the tour')
            hidden(page, True); hidden(page, False); until(page, 'Music.isOn()')
            check(page.evaluate('AutoScroll.isOn()'), path + ': unlocked music and tour resume on return')
    blocked.close()

check(not errors, 'no JavaScript runtime errors: ' + repr(errors))
print(json.dumps({'passed':len(checks), 'errors':errors, 'checks':checks}, indent=2))
