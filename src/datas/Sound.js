const sounder = new Sounder();

// 使用SE：魔王魂

// SE
sounder.addFile("sound/stop.mp3", "stop").addTag("se");
sounder.addFile("sound/syoto.mp3", "syoto").addTag("se");
sounder.addFile("sound/yokoku.mp3", "yokoku").addTag("se");
sounder.addFile("sound/start.mp3", "start").addTag("se");
sounder.addFile("sound/pay.mp3", "pay").addTag("se");
sounder.addFile("sound/replay.mp3", "replay").addTag("se");
sounder.addFile("sound/bet.mp3", "bet").addTag("se");

// BGM
sounder.addFile("sound/big.mp3", "big").addTag("bgm").setVolume(0.4);
sounder.addFile('sound/reg.mp3', 'reg', 11.664).addTag('bgm').setVolume(0.4)

sounder.setMasterVolume(0.5)