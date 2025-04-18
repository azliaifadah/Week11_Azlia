import chrome from 'selenium-webdriver/chrome.js';
import {Builder, By, until} from 'selenium-webdriver';
import assert from 'assert';
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import page_login from '../pages/page_login.js';

describe('Google Search Test', function () {
    let driver;

    it('Login Berhasil', async function () {
        let options = new chrome.Options();
        options.addArguments("--headless");
        // driver = await new Builder().forBrowser('chrome').build();
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();

        assert.strictEqual(title, 'Swag Labs');
        
        // struktur UI
        let inputUsernamePOM = await driver.findElement(page_login.inputUsername)
        let inputPassword = await driver.findElement(page_login.inputPassword)
        let buttonLogin = await driver.findElement(page_login.buttonLogin)

        // logic test
        await inputUsernamePOM.sendKeys('standard_user'); 
        await inputPassword.sendKeys('secret_sauce'); 
        await buttonLogin.click();

        //ss
        let ss_full = await driver.takeScreenshot();
        let imgBuffer = Buffer.from(ss_full, "base64");
        fs.writeFileSync("current.png", imgBuffer);

        if(!fs.existsSync("baseline.png")){
            fs.copyFileSync("current.png", "baseline.png");
            console.log("Baseline image saved");
        }

        //komparasi
        let img1 = PNG.sync.read(fs.readFileSync("baseline.png"));
        let img2 = PNG.sync.read(fs.readFileSync("current.png"));
        let { width, height } = img1;
        let diff = new PNG({ width, height});

        let numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1});

        fs.writeFileSync("diff.png", PNG.sync.write(diff));

        if(numDiffPixels > 0){
            console.log('Visual difference found, different: ${numDiffPixels}');
        }else{
            console.log("No visual difference found.");
        }

        await driver.sleep(2000)        

        // tunggu element tampil
        let buttonCart = await driver.wait(
            until.elementLocated(By.xpath('//*[@data-test="shopping-cart-link"]')), 
            3000
        );
        
        // assert: elememt ada
        await buttonCart.isDisplayed()

        // assert: text dalam element benar
        let textAppLogo = await driver.findElement(By.className('app_logo'))
        let longtext = await textAppLogo.getText();
        assert.strictEqual(longtext, 'Swag Labs');
        await driver.sleep(1000);
        await driver.quit();
    });
});