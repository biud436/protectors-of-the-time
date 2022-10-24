import 'chromedriver';
import * as dotenv from 'dotenv';
import { Builder, By, until } from 'selenium-webdriver';

dotenv.config();

const driver = new Builder()
    .withCapabilities({
        browserName: 'chrome',
        chromeOptions: {
            args: ['--headless', '--disable-gpu', '--window-size=1280,1024'],
        },
    })
    .build();

(async () => {
    await driver.get('https://general.ipacademy.net/servlet/MainController');

    await driver.wait(until.elementLocated(By.id('sso.ID')), 10000);

    // sso.ID 요소 찾아서 입력
    await driver.findElement(By.id('sso.ID')).sendKeys(process.env.ID);
    // sso.PW 요소 찾아서 입력
    await driver.findElement(By.id('sso.PW')).sendKeys(process.env.PW);
    // 'btn_login' 클래스 요소 찾아서 클릭
    await driver.findElement(By.className('btn_login')).click();

    // 잠시 기다린 후, 'https://general.ipacademy.net/servlet/MainController'로 이동
    await driver.sleep(100);
    await driver.get('https://general.ipacademy.net/servlet/MainController');

    // await driver.get(
    //     'https://general.ipacademy.net/servlet/CourseController?cmd=1&sd=IP&md=IP_GEDU&ms=472&aspseq=1&CT=2&courseDivi=area'
    // );

    // // "/images/cm/subBtn/btn_lms_apply.gif" 라는 이미지를 가진 요소 중 3번째 요소를 찾아서 클릭
    // await driver
    //     .findElements(
    //         By.xpath("//img[@src='/images/cm/subBtn/btn_lms_apply.gif']")
    //     )
    //     .then((elements) => elements[2].click());

    // // confirm이 뜨면 확인 버튼 클릭
    // await driver.switchTo().alert().accept();

    // // alert이 뜨면 확인 버튼 클릭
    // await driver.switchTo().alert().accept();

    // 나의 수강실 'https://general.ipacademy.net/servlet/UsrKisuController?cmd=4&ms=466&sd=IP&CT=2&aspseq=1'로 이동
    await driver.get(
        'https://general.ipacademy.net/servlet/UsrKisuController?cmd=4&ms=466&sd=IP&CT=2&aspseq=1'
    );

    // document.querySelector(".subject > a") 를 클릭한다.
    await driver
        .findElement(By.css('.subject > a'))
        .then((element) => element.click());

    // 팝업 윈도우의 주소를 획득한다.
    const popupWindow = await driver.getAllWindowHandles().then((handles) => {
        return handles[1];
    });

    // 팝업 윈도우로 이동한다.
    await driver.switchTo().window(popupWindow);

    // 팝업 윈도우가 열릴 때까지 기다린다.
    await driver.wait(
        until.elementLocated(By.css('div[name*="ItemList"]')),
        10000 * 2
    );

    // 팝업 윈도우에서 By.css("div[name*='ItemList']") 요소의 td > a 요소를 찾아서 차례대로 클릭한다.
    await driver
        .findElement(By.css("div[name*='ItemList']"))
        .then((element) => element.findElement(By.css('td > a')))
        .then((element) => {
            element.click();
        });

    // 마지막 팝업 윈도우에 포커스를 옮긴다.
    const lastPopupWindow = await driver
        .getAllWindowHandles()
        .then((handles) => {
            return handles[2];
        });

    if (lastPopupWindow) {
        await driver.switchTo().window(lastPopupWindow);
    }

    // get document.querySelector("iframe[name='contents']").contentDocument;
    const iframe = await driver.findElement(By.css('iframe[name="contents"]'));
    const iframeDocument = await driver
        .switchTo()
        .frame(iframe)
        .then(() => driver.findElement(By.css('body')));

    // .next_tooltip의 style 중에 display: block 이 될때까지 기다린다.
    await iframeDocument
        .findElement(By.css('.next_tooltip'))
        .then((element) => {
            return driver.wait(until.elementIsVisible(element), 10000 * 2);
        });

    // iframe[name="contents"] 에서 .next 버튼을 찾아서 클릭한다.
    await iframeDocument
        .findElement(By.css('.next'))
        .then((element) => element.click());
})();
