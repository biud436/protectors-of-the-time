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

    // .time_cur 과 .time_tol 요소의 값을 획득하고 둘이 같을 때 까지 기다린다.
    await driver.wait(async () => {
        const timeCur = await driver
            .findElement(By.css('.time_cur'))
            .then((element) => element.getText());
        const timeTol = await driver
            .findElement(By.css('.time_tol'))
            .then((element) => element.getText());

        if (timeCur === timeTol) {
            // .next_tooltip 클래스 요소가 display: none; 이 아니면,
            // .next 요소를 찾아서 클릭한다.
            await driver
                .findElement(By.css('.next_tooltip'))
                .then((element) => element.getCssValue('display'))
                .then((display) => {
                    if (display !== 'none') {
                        driver.findElement(By.css('.next')).click();
                    }
                });
        }
    }, 1000 * 60 * 60 * 24);
})();