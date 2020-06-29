/*
 *   The UI of this app is based on the Localization example:
 *      https://github.com/Moddable-OpenSource/moddable/tree/public/examples/piu/localization
 */

import {} from "piu/MC";
import WipeTransition from "piu/WipeTransition";

const BLACK = "black";
const BLUE = "blue";
const WHITE = "white";

const numbersTexture = new Texture("roboto-120.png");

const blackSkin = new Skin({ fill:BLACK });
const blueSkin = new Skin({ fill:BLUE });
const whiteSkin = new Skin({ fill:WHITE });

let backgroundSkin = blackSkin;
let numberColor = WHITE;

const textStyleBlack = new Style({ font:"OpenSans-Regular-24", color:BLACK });
const textStyleWhite = new Style({ font:"OpenSans-Regular-24", color:WHITE });
const buttonSkinBlack = new Skin({ fill:BLACK, left:20, right:20, top:20, bottom:20 });
const buttonSkinWhite = new Skin({ fill:WHITE, left:20, right:20, top:20, bottom:20 });

const settingsSkinBlack = { texture:{ path:"settings-black.png" }, x:0, y:0, width:34, height:34 };
const settingsSkinWhite = { texture:{ path:"settings.png" }, x:0, y:0, width:34, height:34 };
let settingsSkin = settingsSkinWhite;

//used to select dark/light mode
const ModeButton = Label.template($ => ({
	width:200, left:-10, right:-10, top:0, bottom:0, active:true, string:$.mode,
	skin:$.mode === "Dark" ? buttonSkinBlack : buttonSkinWhite,
	style:$.mode === "Dark" ? textStyleWhite : textStyleBlack,
	Behavior: class extends Behavior {
    onCreate(label, data) {
      this.data = data;
    }
    onTouchBegan(label, id, x, y) {
      application.distribute("onSettingsChange", this.data.mode);
    }
  }
}));

const SettingsContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:blueSkin,
	contents: [
		Column($, {
			left:0, right:0, top:0, bottom:0,
			contents: [
				Row($, {
					left:0, right:0, top:0, bottom:0,
					contents: [
						ModeButton({ mode:"Dark" }),
						ModeButton({ mode:"Light" }),
					]
				})
			]
		})
	],
}));

const SettingsButton = Content.template($ => ({
	skin:settingsSkin, active:true,
	Behavior: class extends Behavior {
    onTouchBegan(label, id, x, y) {
      application.distribute("onSettings");
    }
  }
}));

class numberPortBehavior extends Behavior {
  onDisplaying(port) {
    port.interval = 1000;
    port.start();
  }

  onDraw(port, x, y, w, h) {
  	const yPadding = 10;  // just to shift the numbers down a bit
		let elapsed = port.time;

		let minutes = Math.floor(elapsed / 60000);
		let seconds = Math.floor((elapsed - minutes*60000) / 1000);

    // trace(elapsed, " ", minutes, " ", seconds, "\n");

		const numW = 67.4; //width of the individual numbers in the .png file
		const numH = 105; //width of the individual numbers in the .png file
		const colonW = 26; //width of the colon in the .png file
		let xPos;  //running x position

    //minutes
    port.drawTexture(numbersTexture, numberColor, 0, yPadding, Math.floor(minutes / 10) * numW, 0, numW, numH);
    xPos = numW;
    port.drawTexture(numbersTexture, numberColor, xPos, yPadding, (minutes % 10) * numW, 0, numW, numH);
    xPos += numW;
    //colon, add 5 to give the colon some margin on the right, subtract some from the y to bring the colon off the bottom line
    port.drawTexture(numbersTexture, BLUE, xPos, yPadding-10, 10*numW, 0, colonW, numH);
    xPos += colonW + 5;
    //seconds
    port.drawTexture(numbersTexture, numberColor, xPos, yPadding, Math.floor(seconds / 10) * numW, 0, numW, numH);
    xPos += numW;
    port.drawTexture(numbersTexture, numberColor, xPos, yPadding, (seconds % 10) * numW, 0, numW, numH);

  }
  onTimeChanged(port) {
    port.invalidate();
  }
  restart(port) {
  	port.time = 0;
	}
  onTouchBegan(port, id, x, y) {
    this.restart(port);
  }
}

const NumberContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		SettingsButton($, { right:0, top:0 }),
		// RestartButton($, { left:0, top:0 }),
    Port($, { anchor: "NUMBER_DISPLAY", width:300, height:140, active: true, Behavior:numberPortBehavior }),
	],
}));

class TimerBehavior extends Behavior {
	onCreate(application) {
    if (application.rotation !== undefined){
    	application.rotation = 90;
    }
	}
	onSettingsChange(application, mode) {
		if (mode === "Dark") {
			backgroundSkin = blackSkin;
      numberColor = WHITE;
      settingsSkin = settingsSkinWhite;
		} else {
      backgroundSkin = whiteSkin;
      numberColor = BLACK;
      settingsSkin = settingsSkinBlack;
    }

		let transition = new WipeTransition(300, Math.quadEaseOut, "top");
		application.run(transition, application.first, new NumberContainer({mode}));
	}
	onSettings(application) {
		let transition = new WipeTransition(300, Math.quadEaseOut, "bottom");
		application.run(transition, application.first, new SettingsContainer({}));
	}
}

let TimerApplication = Application.template($ => ({
	contents: [
		Container($, {
			left:0, right:0, top:0, bottom:0,
			contents: NumberContainer({})
		}),
	],
  Behavior:TimerBehavior,
}));

export default function () {
	new TimerApplication(null, { touchCount:1, displayListLength: 2048 });
}
