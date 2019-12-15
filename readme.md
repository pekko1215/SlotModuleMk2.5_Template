# SlotModuleMk2.5
## SlotModuleMkとは
「こだわり抜いたリーチ目を披露したい！」  
「ぼくがかんがえた最強のスロットを作りたい！」  
そんな声を元に、SlotModuleMk2は生まれました。  

リールの回転描写や、滑り処理、役チェックなどの煩雑な処理は、このモジュールがすべてやってくれます。  
あなたは制御や演出をこだわり抜くだけでOK。  
作ったパチスロはWebアプリケーションなので、PC、スマホでそのまま動きます。  
サーバーレスで動作するので、すぐに全世界に公開することができます。

さあ、いますぐにあなたの想像を形にしましょう。


## サンプル台
[ココ](https://pekko1215.github.io/SlotModuleMk2.5_Template/index.html)から遊べます。

## パチスロを作ろう(雑なチュートリアル)
### 1.はじめに
このテンプレートは、4号機ノーマル(ボーナスのみで出玉を増やす台)です。  
絵柄、配列、制御、演出、予告音などを組み合わせて、オリジナルのパチスロを作ってみましょう。  

### 2.絵柄
絵柄はimg/reelchip.pngに、並べた１つの画像として定義します。  
透過を行うと、きれいに表示されます。
各絵柄のサンプルをimg\chipImagesに保管しています。参考にどうぞ

### 3.配列
同封のRCTMaker(SlotModule's Pageさんで配布されていたが、現在はサイトが閉鎖されている。ただし、再配布可能なので同封します。)を使用します。  
src/datas/RCD/control.rcdを開き、編集しましょう。
  
初めての台は、配列はイメージに合った台の配列をパクるのがおすすめです。
１から作る場合、同時入賞してしまうような配置をできるだけ避けましょう。  
そうしないと、岡崎産業のコアのように攻略打法が発覚するかもしれません。

### 4.制御
成立役に対する制御を設定します。  
「ツール→テーブルチェッカー」で、理不尽な小役こぼしが(せめて順押しのときぐらいは)ない、やさしい制御がいいですね。  
変則押しをするときには、成立ラインを絞るとそれっぽくなります。  
小役やボーナスは、複数制御を設定すると深みが出ます。自分だけのこだわりを見つけましょう。  
完成した制御は、「実行->SlotModule用の...」で、src/datas/RCD/control.smrに出力しましょう。

### 5.制御データとコードの紐付け
src/datas/Control.jsを編集します。
RCTMakerの制御ルールと同じ順番になるように、code:[...]を編集します。  
名前は一致しなくても構いません。

### 6.構成役データの紐付けと払い出し枚数の定義
src/datas/Yaku.jsを編集します。
サンプルを参考に、構成役をコードに落とし込みます。  
同時に、払い出し枚数の定義も行います。


### 7.確率
src/datas/Lot.jsを編集し、小役の確率を決定しましょう。  
特に言うことはないです。

### 8.制御振り分け
src/System.jsを編集します。  
slotModule.onLotの内容を編集し、抽選結果と制御を振り分けます。  
ボーナス成立時の5%の制御など、レア制御を決めてやると楽しいかもしれませんね。  


### 9.成立役の処理
slotModule.onHitCheckの内容を編集します。  
主にリプレイとBIG,REG成立時の処理を記述します。

### 10.音
src/Sound.jsを編集します。  
サンプルを参考に、ファイル指定とタグ付けを行います。  
sounder.playSoundで、好きなタイミングで鳴らすことができますよ。

### 11.演出
src/Effect.jsを編集します。  
SyotoEffectに、簡単な消灯と予告音の処理を記述します。
サンプルがあるので、確率をいじるだけでもオリジナリティが出ますね。  
私はサンダーV2を思い出しました。

## SlotModuleMk2.5で用意されている関数など

### freeze()
 - SlotModuleの一切の動作を行えなくします。
 - 必ずresumeで開放してあげてください。かわいそうです。
 
### resume()
 - freezeを開放します。
 - freezeとセットで使おうね

### on(event,fn)
 - eventが発生するたび、fnを実行します。
 - eventは「SlotModuleのイベント一覧」を参照
 - 例(レバーオン時に音を鳴らす)
```javascript
slotModule.on("reelStart", async() => {
    sounder.playSound("start")
})
```

### once(event,fn) -> Promise
 - eventが発生すると、1回だけfnを実行します。
 - fnがtrueを返す場合、もう一回イベントを監視します。
 - Promiseを返すので、async/awaitで書くといい感じですね。
 - 例(countの数だけ、停止音を変化させる。)
```javascript
slotModule.once('reelStop',()=>{
    if(count > 0){
        sounder.playSound('特殊停止音');
        return true;
    }
})
```
 > 注意:fnにasyncな関数を指定しないでください。  
 > PromiseはTruthyであり、思わぬ結果が生じる場合があります。  
 > 多くの場合、onceの呼び出しでasyncを使うことは、良くない実装であり、  
 > 呼び出し元でawaitを使うことで済む場合がほとんどです。

### emit(event,arg)
 - イベント「event」を発火します。
 - 引数としてargを送ることができます。
 - 自作イベントとかを定義するときに役に立つでしょう。
 - サンプルだとbonusEndが自作イベントとして定義されています。


## SlotModuleのイベント一覧
| イベント名 | 発火タイミング |引数|
| ---------- | ------------- | -- |
|pressStop | いずれかの停止ボタンが押されたときに発火します。リール停止の有効無効は問いません。(オールマイティーで押されたときにも発火します)| -- |
|pressStop1|pressStopの左リール限定バージョン| -- |
|pressStop2|中リール| -- |
|pressStop3|右リール| -- |
|pressAllmity|オールマイティーキーが押されたときに発火します。(デフォルトでは上キー)<br>有効無効は問いません| -- |
|pressBet|ベットボタンが押されたときに発火します。有効無効は問いません。<br>(オールマイティーで押されたときにも発火します)| -- |
|pressLever|レバーボタンが押されたときに発火します。有効無効は問いません。<br>(オールマイティーで押されたときにも発火します)| -- |
|reelStop|リールが停止したときに呼ばれます。|`idx:押されたリール, `<br>`count:まだ回転しているリールの数`|
|resourceLoaded|画像リソースの読み込み完了時に発火します。多分使う機会はない| `stage:描画範囲のstageオブジェクト`|
|reelStart|リール変動が開始したときに発火します。| -- |
|allReelStop|すべてのリールが停止したときに発火します。| `onHitCheckで返されるデータ` |
|payEnd|払い出し演出が終了したときに発火します。|
|bet|ベットが完了したときに呼ばれます。| `coin:ベット枚数`|
|leverOn|レバーオン時に呼ばれます| -- |

## Sounderで用意されている関数
### addFile(file, tag, loopStart)
 - タグにtagを設定しfileを読み込み待ちキューに追加します。
 - mp3かwavが無難です。ほかも再生できるかもしれませんが、再生できないブラウザもあるかもしれません。
 - loopStartに時間(s)を指定することで、ループ開始位置を設定することができます。
 - addTag(tag)をつなげることで、複数のタグを設定することができます。

### setVolume(tag,volume)
 - タグにtagを含むサウンドの音量を調節します。
 - 最大が1、最小が0です。

### setMasterVolume(volume)
 - マスターボリュームをvolumeに設定します。

### playSound(tag, isLoop, callback) -> Promise
 - タグにtagを含むサウンドをすべて再生します。
 - isLoopにtrueを指定することで、ループ再生を行います。
 - isLoopがfalseの場合、コールバックを指定することができます。
 - また、コールバックの代わりにPromiseを使用することもできます。

### stopSound(tag)
 - タグにtagを含むサウンドをすべて停止させます。

### サンプル
 - サウンドを3つ読み込み、順番に再生します。
```javascript

const sounder = new Sounder();
sounder.addFile('1.mp3','sound1');
sounder.addFile('2.mp3','sound2');
sounder.addFile('3.mp3','sound3');

const Play = async()=>{
    await sounder.playSound('sound1');
    await sounder.playSound('sound2');
    await sounder.playSound('sound3');
}

Play();
```

## 便利関数
### Sleep(ms)
 - msミリ秒停止します。async関数なのでawaitと一緒に使おうね
 - 例(払い出し後、3秒フリーズ)
```javascript
slotModule.once('payEnd',async ()=>{
    slotModule.freeze();
    await Sleep(3000); // 3秒待ちます
    slotModule.resume();
})
```

### ArrayLot([v1,v2,v3,...])
 - v1+v2+v3+..個のくじを引き、当選したインデックスを返します。
 - 振り分け作るときに便利
 - 例(制御振り分け)
```javascript
ret = ['BIG1','BIG2','BIG3'][ArrayLot([60,30,10])];
/**  
 *  BIG1 60%
 *  BIG2 30%
 *  BIG3 10%
 *   で制御を振り分ける。
 **/
```

### ContinueLot(r)
 - 確率rで継続抽選を行う。
 - 1とか引数にするとぶっ壊れるからやめようね
 - 例(50%のループストック抽選)
```javascript
stock++; // 最低保証
stock += ContinueLot(1/2); // 50%ループ
```

### Rand(m, n = 0)
 - n ~ (n + m-1)までの整数乱数を発生させる。
 - Rand(4)のように書くと、0~3までの乱数を返す
 - !0がtrueになることを利用し、簡易的な抽選にも使用できる
 - 例(1/3で特殊演出を発生させる)

```javascript
if(!rand(3)){
 // 特殊演出を書く
}
```

### ReplaceMatrix(base, matrix, front, back)
 - baseのフラッシュの、matrixが示す箇所に、flashとbackを適用させる。
 - 成立役フラッシュ用の関数なので、直接使う機会はないかも