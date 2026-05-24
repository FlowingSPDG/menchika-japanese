/**
 * Build-time: kuromoji で surface / basic_form → ひらがな読みのスナップショットを生成。
 * Run: npm run generate:readings
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import kuromoji from 'kuromoji'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dictPath = join(root, 'node_modules', 'kuromoji', 'dict')
const outPath = join(root, 'src', 'lib', 'normalize', 'reading-snapshot.json')
const corpusPath = join(__dirname, 'corpus-ja.txt')

const SEEDS = `
好き 今日 明日 昨日 日本 東京 大阪 天気 漢字 地下 世界 人生 学校 会社 友達
メン地下 今まじり 好きだ 今 本当 大丈夫 食べる 飲む 行く 来る 見る 聞く 話す 読む 書く
ある いる する なる できる 思う 知る 使う 持つ 待つ 作る 買う 売る
私 彼 彼女 人 時間 場所 問題 意味 方法 結果 理由 気持ち 感じ
変換 絵文字 出力 入力 コピー 入れ替え 読み スキップ
疲れ 疲れる 疲れた 食べ 食べる しょくじ 食事 少し 今日は疲れています
`.trim().split(/\s+/u)

/** 常用漢字（2136）— 単字読みの補完用 */
const JOYO_KANJI = `一丁七万丈三上下不与丑且世丘丙丞両並中丰串丸丹主乃久之乎乏乗乙九乞也乱乳乾亂了予争事二云互五井亘亙些亜亡交亥亦亨享京亭亮人仁今介仏仔仕他付仙代令以仮仰仲件任企伊伍伎伏伐休会伝伯伴伸伺似伽佃但位低住佐佑体何余作佳併使例侍供依価侮侯侵侶便係促俄俊俗保俠信俣修俳俵俸俺倉個倍倒候借倣値倫倭倹偉偏停健側偵偶偽傍傑傘備催債傷傾僅働像僑僕僚僧儀億儒償優儲允元兄充兆先光克免児党入全八公六共兵其具典兼内円再冒冗写軍農冠冥冬冷凄准凌凍凜凝凡処凧凪凰凱凶凸出刀刃分切刈刊刑列初判別利到制刷券刹刺刻則削前剖剛剝剜剣剤力功加劣助努劫励労効劾勁勃勅勇勉動勘務勝募勢勤勧勲勺勾匁匂包化北匠匡匹区医匿十千升午半卑卒卓協南博卜占印危即却卵卸厄厘厚原厳去参又及友双反収叔取受叙叡叢口古句叩叫召可台史右司各合吉同名后吏吐向君吟否含吸吹呂呈呉告周味呼命咋和咲咽哀品哉員哲哺唄唆唇唐唯唱唾啄商問啓善喉喚喜喝喧喩喪喫喬営嗅嗣嘆嘉嘗嘘噂噛器噴嚇囚四回因団困囲図固国圏園土圧在地坂均坊坐坑坦坪垂型垣埋城域埼培基堂堅堆堕堤堪堰報場堵堺塀塁塊塑塔塗塚塞塡塩塾境墓増墜墨墳墾壁壇壊壌壕士壬壮声壱売変夏夕外多夜夢大天太夫央失夷奄奇奈奉奎奏契奔奥奪奨奮女奴好如妃妄妊妖妙妥妨妹妻姉始姓委姫姻姿威娃娘娠娯婆婚婦婿媒媛嫁嫉嫌嫡嬉嬢子孔字存孝孟季孤学孫宅宇守安完宏宗官宙定宛宜宝実客宣室宮宰害宴宵家容宿寂寄寅密富寒寛寝察寡寧審写寛寮寵寸寺対寿封専射将尉尊尋導小少尚就尺尻尼尽尾尿局居屈届屋屏展属層履屯山岐岡岩岬岳岸峠峡峨峰島峻崇崎崖崚崩嵐嵯巌巖川州巡巣工左巧巨巫差己已巴巻巽巾市布帆希帖帝帥師席帯帰帳常帽幅幌幕幡幣干平年幸幹幻幼幽幾庁広庄庇床序底店府度座庫庭庵庶康庸廃廉廊廟延廷建廻弁弄弊式弐弓弔引弘弟弥弦弧弱張強弾当彙形彩彫彰影役彼往征径待律後徐徒従得徠御復循微徳徴徹心必忌忍志忘忙応忠快念忽怒思怠急性怨怪恋恐恒恢恣恥恨恩恭息恰恵悌悔悟悠患悦悩悪悲悼情惇惑惜惟惨惰想愁愈愉意愚愛感慄慮慰慶憂憎憤憧憩憬憲憶憾懇懐懲懸成我戒戯房所扇扉手才打払扱扶批承技抄把抑投抗折抜択披抱抵抹押抽担拉拍拐拒拓拘拙招拝拠拡括拭拳拶拷拾持指挑挙挟挨挫振挿捉捌捍捕捗捜捧捨据掃授掌排掘掛採探接控推措掬掲描提揚換握揮援揺損搬搭携搾摂摑摘摩摯摺撃撒撞撤撫播撮撰撲擁操擦擬支改攻放政故敏救敗教敢散敦敬数整敵敷文斉斎斐斗料斜斡斤斥斬新方施旅旋族旗既日旦旧旨早旬旭旺昂昆昇昌明昏易昔星映春昧昨昭是昴昼時晃晄晋晏晟晦晩普景晴晶暁暇暉暑暖暗暢暦暫暮暴暼曇曖曙曜曲更書曹曼曾替最月有朋服朔朕朗望朝期木未末本札朱朴机朽杉李杏材村杖杜杞束条来杯東杵杷松板枇枕林枚果枝枠枢枯架柄某染柔柱柳柵査柿栃栄栓校株核根格栽桁桃案桑桔桜桟桧桶桿梅梓梗梢梧梨梯械梱梶棄棉棋棒棚棟棡森棺椅椋植椎椙検椰楊業楯楳極楷楼楽概榔榛榮榴槇構様槙槻槽標模権横樹樺樽橋橘橙機檜櫛櫓櫟櫻欄欝欠次欧欲欺欽款歓止正武歩歯歳歴死殉殊残殖殴段殺殻殿毀毅母毎毒比毛毬氏民気水氷永氾汀汁求汎汐汗汚汝江池汰決汽沃沈沌沐沖沙没沢沫河沸油治沼沽沿況泉泊泌法泡波泣泥注泯泰泳洋洗洞津洪洲洵洸活派流浄浅浜浦浩浪浬浮浴海浸消涙涯液涼淑淡深淳淵混添清渇済渉渋渓減渡渦温測港湖湛湧湯湾湿満源準溝溶溺滅滋滑滝滞滴漁漂漆漏演漠漢漣漫漬漱漸潔潜潟潤潮潰澄澪激濁濃濫濯瀕瀬灌灘火灯灰災炉炊炎炭点為烈烏無焦然焼煎煙照煩煮熊熟熱燃燥爆爪爬爲爵父爽片版牙牛牧物牲特犠犬犯状狂狄狙狩独狭狼猛猟猪猫献猴猶猿獄獣獲玄率玉王玖玩珀珂珈珊珍珠班現球理琉琢琥琲琳琴瑚瑛瑞瑠璃璧環璽瓦瓶甘甚生産用甫田由甲申男町画界畏畑畔留畜畝略番異畳疎疑疫疲疾病症痕痘痛痢痩痴瘍療癒癖発登白百的皆皇皐皓皮皿盆益盗盛盟監盤目盲直相盾省眉看県眞真眠眺眼着睡督睦瞬瞭瞳矛矢知矩短矯石砂研砕砲破硝硫硬碁碇碑磁磐磨礁礎示礼社祇祈祉祐祖祝神祢祥票祭禁禄禅禍福秀私秋科秒秘租秩称移程税稚種稲稼稿穀穂積穏穫穴究穹空突窃窒窓窮窯立竜章童端競竹笑笛符第笹筆筈等筋筑筒答策箇箋箔箕算管箱箸節範築篠篤簡簾簿籍籠米粁粉粋粒粗粘粛粥粧精糎糖糧糸系糾紀約紅紋納純紗紘紙級紛素紡索紫紬累細紳紹紺終絃組経結絞絡絢給統絵絶絹継続維綱網綴綻綿緊緋総緑緒線締編緩緯練縁縄縛縦縫縮績繁繊織繕繭繰缶罪置罰署罵罷羅羊美羚羞群義羽翁翌習翔翠翻翼耀老考者耐耕耗耳耶聖聞聯聰聲聴肇肉肌肖肘肝股肢肥肩肪肯育肺胃胆背胎胞胡胤胴胸能脂脅脇脈脊脚脩脱脳腎腐腕腫腰腸腹腺膚膜膝膨膳臆臓臣臨自臭至致臼與興舌舎舗舞舟航般舵舶舷船艇艘艦良色艶艸芋芙芝芯花芳芸芹芽苑苗苛若苦英茂茎茜茨茶草荒荘荷荻莉莞莫菅菊菌菓菖菜菫華萬葬葵蒔蒸蒼蓄蓋蓑蓬蔑蔡蔦蔵蔽蕎蕨薄薙薦薪薫藍藏藤藩藻虎虐虚虜虞虫虹蚊蚕蛇蛍蛮蜂蜜融蟲血衆行術街衛衝衡衣表衰衷袋袖被裁裂装裏裕補裟裳裸製複褐褒襟襲西要覆覇見規視覚覧親観角解触言訂訃計訊討訓託記訟訪設許訳訴診証詐詔評詞詠詢試詩詮話該詳誇誉誌認誓誕語誠誤説読誰課調談請諒論諦諧諭諮諸諾謀謁謂謄謎謙講謝謡謹識譜警議譲護讃谷豆豊豚象豪豹貌貝貞負財貢貧貨販貪貫責貯貰貴買貸費貼貿賀賂賃賄資賊賓賛賜賞賠賢賦質賭購贈赤赦走赳赴起超越趣足距跡路跳践踊踏踪蹟蹴躍身車軌軍軒軟転軸軽較載輝輩輪輸轄轟辛辞辣辰辱農辺込迅迎近返迫迭述迷追退送逃逆透逐逓途通逝速造連逮週進逸遂遅遇遊運過道達違遙遜遠遡遣遥適遭遮遵遷選遺遼避還邑那邦邪邸郁郊郎郡部郭郵郷都酉酌配酎酒酔酢酵酷酸醒醜醸采釈里重野量金釜針釣鈍鈴鉄鉛鉢鉦鉱銀銃銅銘銭鋒鋤鋭鋳鋼錆錠錦錫錬錮錯録鍵鎌鎖鎧鎮鏡鐘鑑長門閃閉開閏閑間関閣閤閥閲闇闘阜阪防阻陀附降限陛院陣除陥陪陰陳陵陶陸険陽隅隆隈隊階随隔隙際障隠隣隷隻隼雁雄雅集雇雌雑雛離難雨雪雰雲零雷電需震霊霜霞霧露青静非面革靭靴韓音韻響頂頃項順須頌預頑頒領頭頻頼題額顎顔顕願類顧風飛食飢飯飲飼飽飾餅養餌餓館首香馬駄駅駆駐駒騎騒験騰驚骨骸髄高髪髭鬱鬼魂魅魔魚鮎鮮鯉鯛鯨鱗鳥鳳鴻鵬鶏鶴鹿麒麓麗麟麦麺麻麿黄黒黙黛鼓鼻齊齢`

const SMALL_TO_FULL = {
  ぁ: 'あ',
  ぃ: 'い',
  ぅ: 'う',
  ぇ: 'え',
  ぉ: 'お',
  ゃ: 'や',
  ゅ: 'ゆ',
  ょ: 'よ',
  ゎ: 'わ',
}

function expandSmallKana(s) {
  return [...s].map((ch) => SMALL_TO_FULL[ch] ?? ch).join('')
}

function katakanaToHiragana(s) {
  return s.replace(/[\u30a1-\u30fa]/gu, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  )
}

function addReading(map, surface, readingKata) {
  if (!surface || !readingKata || readingKata === '*') return
  const hira = expandSmallKana(
    katakanaToHiragana(readingKata).replace(/\u30fc/gu, 'ー'),
  )
  if (!map[surface]) map[surface] = hira
}

function ingestText(map, tokenizer, text) {
  if (!text.trim()) return
  for (const t of tokenizer.tokenize(text)) {
    const r = t.reading || t.pronunciation
    addReading(map, t.surface_form, r)
    if (t.basic_form && t.basic_form !== '*') {
      addReading(map, t.basic_form, r)
      if (t.basic_form.endsWith('る')) {
        const stem = t.basic_form.slice(0, -1)
        if (t.surface_form === stem) {
          const hira = expandSmallKana(
            katakanaToHiragana(r).replace(/\u30fc/gu, 'ー'),
          )
          if (hira.endsWith('る')) addReading(map, stem, hira.slice(0, -1))
        }
      }
    }
  }
}

kuromoji.builder({ dicPath: dictPath }).build((err, tokenizer) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  const map = Object.create(null)

  for (const seed of SEEDS) ingestText(map, tokenizer, seed)

  const corpus = readFileSync(corpusPath, 'utf8')
  for (const line of corpus.split('\n')) ingestText(map, tokenizer, line)

  const joyoSeg = new Intl.Segmenter('ja', { granularity: 'grapheme' })
  for (const part of joyoSeg.segment(JOYO_KANJI)) {
    const ch = part.segment
    ingestText(map, tokenizer, ch)
  }

  const sorted = Object.fromEntries(
    Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'ja')),
  )

  writeFileSync(outPath, JSON.stringify(sorted))
  console.log(`Wrote ${Object.keys(sorted).length} entries → ${outPath}`)
})
