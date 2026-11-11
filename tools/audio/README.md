# 离线优先的音频素材流水线

`pipeline.py` 从定稿源文件整理、验证朗读文本，获准后才生成 MP3；`release.py` 负责清单、新鲜度与发布校验；`blob.cjs` 只负责显式上传。普通网页构建只调用离线新鲜度解析，**不会调用 TTS、上传或读取凭据**。完整操作见 [WORKFLOW.md](WORKFLOW.md)。

## 当前决定与范围

- 云健 `zh-CN-YunjianNeural`，`pitch=+0Hz`、`rate=+0%`、`volume=+0%`；网页初始1×。
- `prepare`、`validate`、`verify-audio` 与 dry-run 均离线。只有 `synthesize --execute` 才导入 Edge SDK、发送文字，且必须显式限定 `--selection` 或 `--only`。
- **覆盖计划不是默认生成/上传授权。** 当前 `src/audio_scope.json` 已覆盖13条完整主线（史前、希腊、罗马、埃及、中世纪西欧、东罗马、十字军、北欧、东欧、美洲、中国、西班牙、中东）及14个动力专题，policy3 共2619段（2606个唯一MP3文件）；剩余6条主线按批次显式 `--selection` 推进。
- 旧policy2的220段音频与2462份文本留作历史记录，不能冒充新规成品。新库换目录，共享缓存按实际朗读输入复用。
- Node VM 只用于可信本地源数据，不是恶意 JavaScript 的安全沙箱。不改原文、不付费兜底、不自动重试或扩展到全书。

## 目录与版本

代码、测试在 `project-files/`，素材与MP3必须在其外，例如 `work/v35/audio_library/v112-policy3-era2-r2/`。

```text
素材库/
  source.json        冻结快照；源commit、脏源状态、三个内容文件SHA
  catalog.json       全书预期ID、policy、提取工具SHA、来源指纹、元数据复核表
  items/*.json       每份素材的字段来源、文本SHA、字符数、排除项
  text/*.txt         实际送给TTS的UTF-8文本
  validation.json   已准备项回算；区分本次选择和全书目录
  audio-state.json  schema2紧凑索引；不重复内嵌WordBoundary
  failures.jsonl    失败ID与原因；成功项保留
共享 audio-cache/
  audio/<MP3字节SHA>.mp3
  receipts/<输入指纹>.json
  failed/<输入指纹>.mp3 / .json
  uploads/<获批host>.json
```

源文件或提取契约变了，必须新建素材库，不手改 `text/items/catalog`。`catalog.json` 固定 `extract.cjs` 和 `text.py` 的哈希，源文件须已定稿且无未提交内容改动；三个源文件的实际SHA是校验依据。目录锁、同目录原子替换保证逐项保存与续做。

## policy3：读什么、不读什么

| 类型 | ID | 内容 |
|---|---|---|
| 历史节题前奏 | `history-xxx/title` | 中文、英文节题；不读纯时间元数据 |
| 历史幕正文 | `history-xxx/0` | 幕标题、正文；不含补充或人物卡 |
| 完整专题正文 | `topic-xxx` | 专题中英文标题、每幕副标题/标题/正文 |
| 名场面 | `<entry>/<scene>/moment/<j>` | 一则名场面的中英文标题与正文 |
| 豆腐块 | `<entry>/<scene>/box/<j>` | 一个豆腐块的中英文标题与可读正文 |
| 人物卡 | `<entry>/<scene>/person/<j>` | 姓名、外文、事件、关系、小事、展开生平 |

`scene` 从0计数；moment/box的 `j` 是它在该节数组里的下标，person的 `j` 是本幕人物卡下标。路径拒绝别名、前导零和越界形状。

### 时间字段不是一律删除

只处理固定位置的时间信息，**不对正文或题名做年份/数字正则清洗**。历史 `period/date`、人物 `when/life` 中能确认的时间标签不读，包括“古风时代”“公元前后”。正文年份、数字、单位、外文括注保持原样。

**专题的 `scene.date` 实际是副标题，不是年代。** 当前67个值包含“中央官制”“技术链”“1:10 与 1:1000”等，须在幕标题前朗读；未显示在阅读区的专题 `period` 仍不读。不能因为字段名叫date或DOM用了small，就把有意义的小标题一起删掉。

固定年份栏位（历史节 `period`、历史幕 `date`、人物卡顶栏 `when` 与 `life`）即使偶尔混入非年份文字也**一律不读**（老无已拍板统一省略）；仅专题各幕 `scene.date` 副标题保留在幕标题前，并记入 `retainedMetadata` 供核对。

### 来源、补充和其他排除

- “史料与延伸阅读”的全部外链标题与资料头不读；人物卡的资料列表不读。人物字段内HTTP/HTTPS/协议相对外链的整段可见链接文字也不读；内部跳转链接保留。
- 正文里的书名、引文、出处说明与年份是作者写的叙事，**不因它们像引用就删掉**。不读的参考资料以用户指明的资料区域/人物外链为界。
- 名场面/豆腐块归“包括补充趣事”；整张人物卡（含小事note和bio）归“包括人物小传”。默认两项都不勾，可在朗读前或播放中勾选；勾选的补充趣事、人物小传作为独立条目列入播放列表，可顺序接播或直接点选。
- 表格本体、图片、SVG/canvas、音视频、脚本样式、按钮/input/select/iframe不读，保留其周围标题和文字。地图、图例、钉注、导航、线路收尾说明、年代横切片、基础地理词条及scene.note工具提示不属于本入口。
- HTML实体解码，块间换行；不翻译、概括、修辞改写或删难读名字。
- 每块保留源字段指针。重复/缺失幕段、无归属正文、人物丢失、无效幕号/线路和浏览器会改写边界的段落嵌套均报错，不悄悄漏过。

## 离线准备与验证

只需Python3.9+与Node。以下在代理工作区根目录执行；源工作树默认是脚本所属的 `project-files/`。

```sh
PIPE=project-files/tools/audio/pipeline.py
LIB=work/v35/audio_library/v112-policy3-era2-r2
# 本轮明确的160项选择；不要用497项计划替代授权。
SELECT=work/v35/audio_runs/v112-era2/selection-all-new.json
python3 "$PIPE" prepare --library "$LIB" --selection "$SELECT" --limit 25
# 重复准备下一批，最后验证本次选择完整：
python3 "$PIPE" validate --library "$LIB" --selection "$SELECT" --complete
```

`--selection` 接受ID数组或包含ids/profile/policy的JSON对象。限定准备不降低结构检查：仍校验全源结构与所有已准备文件，并逐字段、逐字节回算。`--complete --selection` 表示**选择完整**，不表示全书完整；不带selection才要求全目录。本轮160/160，全目录5284，是两种不同计数。超过8000字符的材料列出，不截断。

先检查导出的实际文本及元数据复核表，再允许TTS。独立DOM对照还要检查合同本身：r1曾错误删除专题副标题，虽然提取器与照同一误解写的oracle相符，人工复核仍发现并在合成前修正。r1未发给TTS；r2与修正后的页面oracle160/160逐字一致（只忽略空白，标点也校验）。

## 显式、串行合成

```sh
PY=work/v35/audio_poc/.venv/bin/python
# 这里只计划；cachedReceipt只是候选，不是本轮已验收。
"$PY" "$PIPE" synthesize --library "$LIB" --selection "$SELECT" --pitch=+0Hz --limit 2
# 获准后才执行。已通过的实际相同输入复用，不暗中全书生成。
"$PY" "$PIPE" synthesize --library "$LIB" --selection "$SELECT" --pitch=+0Hz --limit 2 --execute
python3 "$PIPE" verify-audio --library "$LIB" --selection "$SELECT" --pitch=+0Hz
```

需要新环境时，在持久目录建venv并安装 `requirements-tts.txt`；纯文本工作不需要Edge依赖。`--pitch=-5Hz`仅用于另行获准的实验，正式始终+0Hz。

输入指纹取**实际朗读文本SHA＋provider/SDK/声线/语速/音高/音量/边界设置**；ID或policy编号不作为无谓重录理由。同文不同ID可以复用。输出文件名取MP3字节SHA，不覆盖“latest.mp3”。改正文、某个独立补充或人卡只使对应输入失效；标题单独失效；表格单元格、地图、已排除的日期/来源变动不改变声音。

- 单并发分批，默认单项超时300秒，每条成功立即保存receipt与紧凑state；共享缓存也加锁。
- 真失败就停，保留已完成结果和failed证据，查明后再决定恢复，不盲目整轮重跑。Edge7.3.1内部可能为HTTP403时钟校正重连，不能承诺整个调用栈零重试。
- `networkRequests`在synthesize报告里是**新合成任务数**，不是WebSocket/HTTP/长文本分段数；离线校验该值严格为0。
- MP3须单音轨、24kHz/mono、正时长，`ffmpeg -xerror`完整解码；核对字节SHA、WordBoundary文字覆盖/时间顺序及尾部。复用也重查这些条件，不仅看文件是否存在。
- 边界文字比较允许空白、标点与兼容字形正规化差别，不做音频内容识别。非末段重复/静音、发音、语义完整性可能绕过机器检查；**machine-checked不等于人工听审**，listeningReview另记pending。
- 圈码、外文、特殊字符出错要查证，不为通过验收删字。不能擅自把未获准的其他线路拿来试音。

### 同文重录

先确认具体ID与重录授权，停止生成/上传，备份receipt和state。把旧receipt移出活跃缓存，移除state中共享该inputHash的引用；**保留旧哈希MP3及Blob**。再明确 `--only <ID> --execute`、验证、预览、上传、换清单。返回字节相同仍是同一录音，不能声称改善了发音。不得伪造receipt、减弱边界检查或直接导入未知声线。

## 清单与播放器

manifest使用schema2/policy3；每项仍为url/duration/bytes/textHash/inputHash/audioHash。组装器从**当前源**派生 `tracks[bodyId] = {bodyId,titleId,extras,people}`，忽略来稿清单自带的播放计划，保留缺少音频的预期片段ID。

普通构建过滤陈旧/缺失/超范围音频，不阻塞正文；非法schema/profile/host/URL/哈希/元数据仍失败。缺少可选片段不影响正文模式，勾选后不得跳过；缺标题会撤依赖它的历史片段。完整音频发布另用窄scope做 `--strict --remote`，不把全书计划变成整站发布门禁。详见WORKFLOW。

## 测试与证据

```sh
python3 project-files/tests/run_tests.py verify-audio-pipeline.js verify-audio-player.js --jobs 2
python3 project-files/tests/run_tests.py --changed
```

34项离线单测覆盖结构、时间/副标题、引用删除、独立分段、选择完整性、输入/源篡改、缓存/失败/锁、清单过期与缺段降级。原生MP3 fixture覆盖播放器而不是TTS内容；真实录音可另设 `AUDIO_PLAYER_SMOKE_MANIFEST` 抽检所供片段。全部经过runner/chrome_guard，不直接启动无守护Chrome。缓存包含Python/音频工具和播放器私有组装输入；改runner须跑verify-no-leak。

fixture在runner管理的临时目录，依赖/持久脚本不放/tmp。Git不保留素材、音频、receipt、上传ledger或源码树外的窄scope/selection/BUILD证据，移交/删除工作区前先备份。当前生成、上传、测试、部署的实际结果见本轮BUILD记录，不能把本文的示例命令当作已经执行。
