/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
import 'chromedriver';
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { Builder, By, ThenableWebDriver, until } from 'selenium-webdriver';
import { io } from 'socket.io-client';

dotenv.config();

const driver = new Builder()
    .withCapabilities({
        browserName: 'chrome',
        chromeOptions: {
            args: ['--headless', '--disable-gpu', '--window-size=1280,1024'],
            position: '0,0',
        },
    })
    .build();

class SocketClient {
    public socket = io('http://localhost:3000', {
        transports: ['polling', 'websocket'],
        autoConnect: false,
    });

    constructor() {
        this.socket.connect();

        this.socket.on('connect', () => {
            this.socket.emit('log', '크롬 드라이버에 연결되었습니다.');
        });
        this.socket.on('disconnect', () => {
            this.socket.emit('log', '크롬 드라이버와 연결이 끊겼습니다.');
        });
    }

    send(logMessage: any) {
        this.socket.emit('log', logMessage);
    }
    warn(logMessage: any) {
        this.send(logMessage);
    }
    log(logMessage: any) {
        this.send(logMessage);
    }
}

class HostClient {
    public socketClient = new SocketClient();

    /**
     * 수강 중인 강의 목록을 가져온다.
     *
     * @param _driver
     * @returns
     */
    async isEnrolledLecture(_driver: ThenableWebDriver) {
        const target = '/images/usr/ip/cm/btn/btn_no_complete.gif';

        const elements = await _driver.findElements(
            By.xpath(`//img[@src="${target}"]`)
        );

        let isEnrolled = false;

        if (elements.length > 0) {
            isEnrolled = true;
        }

        return isEnrolled;
    }

    /**
     * 경고창을 자동으로 닫는다.
     * @param _driver
     */
    async alertWindowBlock(_driver: ThenableWebDriver) {
        const alertWindow = await _driver.switchTo().alert();
        await alertWindow.accept();
    }

    /**
     * 요소가 존재하지 않을 때 셀레니움 오류를 제거한다.
     * @param _selector
     * @returns
     */
    async safeFindElement(_selector: By) {
        let element = null;

        try {
            element = await driver.findElement(_selector);
        } catch (e) {
            console.log('safeFindElement', e);
        }

        return element;
    }

    async start() {
        await driver.get(
            'https://general.ipacademy.net/servlet/MainController'
        );

        await driver.wait(until.elementLocated(By.id('sso.ID')), 10000);

        // sso.ID 요소 찾아서 입력
        await (
            await this.safeFindElement(By.id('sso.ID'))
        ).sendKeys(process.env.ID);
        // sso.PW 요소 찾아서 입력
        await driver.findElement(By.id('sso.PW')).sendKeys(process.env.PW);
        // 'btn_login' 클래스 요소 찾아서 클릭
        await driver.findElement(By.className('btn_login')).click();

        // 잠시 기다린 후, 'https://general.ipacademy.net/servlet/MainController'로 이동
        await driver.sleep(100);
        await driver.get(
            'https://general.ipacademy.net/servlet/MainController'
        );

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
        const popupWindow = await driver
            .getAllWindowHandles()
            .then((handles) => {
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
        const itemList = await driver.findElement(
            By.css("div[name*='ItemList']")
        );

        const elements = await itemList.findElements(By.css('td > a'));

        // 3초 기다린다.
        await driver.sleep(3000);

        for (const element of elements) {
            await driver.sleep(1000);

            const elementText = await element.getText();

            this.socketClient.log(elementText + '체크 중...');

            try {
                // a의 부모인 td 선택하고 그 부모인 tr 선택
                const tr = await element
                    .findElement(By.xpath('..'))
                    .findElement(By.xpath('..'));

                this.socketClient.log(
                    `tr이 선택되었습니다 : ${await tr.getText()}`
                );

                // 5번째 td의 텍스트를 찾는다
                const td = await tr.findElement(By.xpath('td[5]'));

                // 진행률 td 선택
                const progressTd = td;

                // 진행률 td의 텍스트를 가져온다.
                const progressText = await progressTd.getText();

                this.socketClient.log(`진행률 : ${progressText}`);

                if (progressText.includes('100%')) {
                    this.socketClient.log(
                        `${await element.getText()} 이미 수강 완료되었습니다.`
                    );
                    continue;
                }

                await element.click();

                // 3초 기다린다.
                await driver.sleep(3000);
            } catch (e) {
                this.socketClient.warn(e);
            }

            // 마지막 팝업 윈도우에 포커스를 옮긴다.
            const windows = await driver.wait(driver.getAllWindowHandles());
            this.socketClient.log(windows);
            await driver.switchTo().window(windows[2]);

            await driver.sleep(1000);
            // iframe 찾기
            // iframe으로 이동
            await driver
                .switchTo()
                .frame(driver.findElement(By.xpath(`\/\/*[@id="contents"]`)));

            await driver.sleep(1000);

            const pageTotal = await driver
                .findElement(By.className('page_total'))
                .getText();

            for (let i = 0; i < +pageTotal; i++) {
                const pageCurrent = await driver
                    .findElement(By.className('page_current'))
                    .getText();
                this.socketClient.log(`${pageCurrent} / ${pageTotal}`);
                await driver.sleep(1000);
                await driver.wait(
                    until.elementLocated(
                        By.xpath(`\/\/*[@id="fs-footer"]/div/div[2]`)
                    ),
                    30000
                );

                // time_cur
                // time_tol

                let timeTol = await driver
                    .findElement(By.className('time_tol'))
                    .getText();

                await driver.sleep(500);

                if (timeTol === '00:00') {
                    await driver.sleep(1000);
                }

                let page_current: any = 1;

                let done = false;
                while (!done) {
                    await driver.sleep(1500);
                    const timeCur = await driver
                        .findElement(By.className('time_cur'))
                        .getText();
                    timeTol = await driver
                        .findElement(By.className('time_tol'))
                        .getText();

                    page_current = await driver
                        .findElement(By.className('page_current'))
                        .getText();

                    const page_total = await driver
                        .findElement(By.className('page_total'))
                        .getText();

                    this.socketClient.log(
                        `현재 페이지 : ${page_current} / ${page_total} | 현재 시간 : ${timeCur} / ${timeTol}`
                    );

                    // TODO: 디버깅 용
                    // if (+page_current < +page_total) {
                    //     await driver.sleep(1000);
                    //     await driver.findElement(By.className('next')).click();
                    //     continue;
                    // }

                    if (timeCur === timeTol) {
                        await driver.sleep(1000);

                        const btnNext = driver.findElement(
                            By.className('next_tooltip')
                        );

                        if (+page_current === +page_total) {
                            this.socketClient.log('마지막 페이지 입니다.');
                            await driver.findElement(
                                By.className('page_current')
                            );
                            done = true;
                        }

                        if (+page_current === +page_total - 1) {
                            await driver
                                .findElement(By.className('next'))
                                .click();
                        }

                        if (await btnNext.isDisplayed()) {
                            this.socketClient.log(+page_current);
                            this.socketClient.log(+page_total);
                            if (+page_current < +page_total) {
                                await driver
                                    .findElement(By.className('next'))
                                    .click();
                            }
                        } else {
                            await driver.sleep(1000);
                        }
                    }
                }

                this.socketClient.log('페이지 루프 종료');
                this.socketClient.log(`-- ${i} / ${pageTotal} --`);

                if (+page_current === +pageTotal) {
                    this.socketClient.log('다른 강의로 이동합니다.');
                    break;
                }
            }

            await driver.sleep(3000);
            await driver.close();
            await driver.switchTo().window(windows[1]);
        }
    }
}

const hostClient = new HostClient();
hostClient.start();
