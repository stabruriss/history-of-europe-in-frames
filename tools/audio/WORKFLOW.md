# 音频新增、替换与发布流程

## 已定口径

- 云健 `zh-CN-YunjianNeural`，pitch `+0Hz`、rate/volume `+0%`，网页初始1×。
- 当前policy3/r3：固定年份栏即使混入文字也一律省略，正文年份不动；不读“史料与延伸阅读”或人物外链文字。**专题date实际是副标题**，必须保留并记入retainedMetadata，细则见 [README.md](README.md)。
- 每幕一份正文、节题另作前奏；每题一份完整专题正文；每则名场面、豆腐块和人物卡各自一份。两项“包括补充趣事”“包括人物小传”默认关闭，整张人物卡的小事/生平归人物组。
- 播放顺序：节题（开始朗读或自然接播到新节时）→正文→勾选趣事→勾选人物。手动上一项/下一项、列表点选与系统媒体切歌直接播目标幕正文，不重复节题；可选条目直接播自身。专题补充接在整题正文之后。勾选的趣事与人物小传作为独立条目列入播放列表，前奏不占行；朗读前与播放中均可切换，只影响未经过的片段。
- Chromium默认将原始MP3经MSE接入同一条连续流，预取/追加后面最多两段；自然接播不换src、不暂停。依赖R2 CORS保持 `Access-Control-Allow-Origin: *`，不可只用逐段element模式的smoke代替默认stream生产验证；真机锁屏仍由实际手机验证。其他浏览器/不可流式片段使用逐段模式。前奏中按下一项进入本幕正文。
- 浏览和播放独立；连续朗读冻结真实整线（包括点击幕之前的幕），到尾停止、不循环。缺音频（清单没有或已过期）的片段播内嵌暂缺提示后接着读下一段，连续缺段只提示一次，入口不因缺段禁用；已发布文件加载失败仍停住重试。

### 计划、制作选择、公开范围必须分开

`src/audio_scope.json` 当前覆盖29条线路（22条主线＋7条事件支线）、龙门架 `gantry-1914` 与15个动力专题，共5790段（5777个唯一MP3文件）；其中 v123 升级史前与古希腊全23站83幕（线路与龙门架不变），新增98段、改文重录76段共174段（165段新合成、9段挪编号人物卡按 inputHash 复用旧录音，1处下标 `₂` 单字 WordBoundary 警告按规留档），旧5616项直接复用，11个旧编号退场（远端旧对象保留）；此前 v122 把 `ww2` 加入 scope.lines（排在 `ww1` 之后），新增二战支线6站32幕66段、专题15《现代战争》4段与日本平安一站5块妖怪豆腐块，并重录日本线4段改文，共79段全部新合成，旧5624项直接复用，无退场、无过期（4份被替换旧录音不再引用，远端对象保留）；此前 v121 把 `japan` 加入 scope.lines，新增日本主线10站54幕共123段，全部新合成，旧5505项直接复用，无退场、无过期；此前 v120 在中东线新增一站 `history-persia-qajar` 共15段，线路数与龙门架不变，旧5490项直接复用；此前 v119 新增东欧线豆腐块 `history-eeurope-october/1/box/1` 1段，线路与龙门架不变，旧5489项直接复用。此前 v116 把 `austria` 加入 scope.lines、`gantry-1914` 写进 scope.gantries，新增53段全部新合成（奥匈线4节16幕、龙门架14幕及其节题与豆腐块、意大利与德意志两则豆腐块、12次人物出场），旧5436项直接复用，无退场、无过期。随后 v117 只重录龙门架14幕正文（按母本还原全文，一幕一个带 `data-scene-text` 的容器，内含多个自然段），段数仍为5489、文件数仍为5476，其余5475项复用；龙门架节题与豆腐块朗读文本未变（豆腐块新增的四档表格本体不读，表外平文照读）。此前 v115 线路不变，新增/改动30段条目：13段新合成（理查一世前4幕正文、两座百年战争月台的节题与各3幕正文、百年战争支线第2幕改文），17段是理查一世节内挪了编号的正文、名场面与人物卡，按 inputHash 直接复用旧录音。旧5406项直接复用，8个旧编号退场、7份被改写正文的旧录音不再引用（远端对象保留不删）。此前 v114 加入 `portugal`、`discovery` 两线并新录/改录72段。线路移动不改变录音；新增支线须加入scope.lines并离线刷新ids/counts/sourceCommit，避免把移过去的有效资产误剔为obsolete。当前源无pending/stale；未变成无瑕疵承诺，README已列出两处存量Markdown表格问题；此前记录的阿梅斯（Metz）托误括注已在 3ac85e5 修正并重录。

**日常改稿定稿、测试通过后，默认接续增量补录并一并发布。** 内容负责人移交冻结提交与源文件哈希，音频负责人据此核对改动，刷新覆盖计划，限定本次新增、改文的片段。录前审朗读稿，录后检查音频、上传文件、合并并校验清单，再组装网页、测试和发布。老无明确要求正文先行时，按普通组装流程先发正文。此前已完成的自动批次顺序：基督教/十字军 → 德意志＋意大利494段 → 英国＋法国1353段 → 低地98段及全书查漏、新增/改稿补录；每批必须验收并上线成功，才执行下一批。总表在 `work/v35/audio_runs/v112-auto-finish-plan.json`。基督教此前补720段，十字军254段原已齐全；德意批补494段；英法批补1353段；最后一批108份新/改输入录成，累计5286段已通过R2远端校验。普通构建始终支持部分嵌入，不因未录线路阻塞改稿。

## 音频对象存储托管（Cloudflare R2 主用，兼容 Vercel Blob）

当前正式音频托管在专用 **Cloudflare R2** 公开桶 `atlas-history-audio`（`pub-c8293c639c2c4658b07a4461d1540b6f.r2.dev`，48kbps 原音质单文件直传，10GB 免费存储、每月100万次写入免费、免流量费）；网页托管仍保持 Vercel Hobby（`history-of-europe-in-frames`）。`release.py` 同时保留 `r2.cjs`（`*.r2.dev`）与 `blob.cjs`（`*.public.blob.vercel-storage.com`）两套不可变上传通路。

本轮专题公开发布及专用Public Blob已获准。开通存储不是升级Pro；不购买套餐、不改支付信息、不放开额外收费。创建是否完成、上传多少仍以BUILD记录为准，不把许可当执行结果。

固定使用CLI65.14.0，不全局升级已有CLI。链接/建库可能自动env pull，必须用源码树外专用目录，并删除自动落盘的凭据：

```sh
cd project-files
SRC="$(pwd -P)"
CONTROL="$SRC/../work/v35/audio_storage_cli"
mkdir -p "$CONTROL"
chmod 700 "$CONTROL"
cd "$CONTROL"
npx --yes vercel@65.14.0 link --project history-of-europe-in-frames \
  --scope chris-projects-41eb6ac7 --yes
# 先检查 .vercel/project.json 的项目/团队ID；不对新建或错链的项目继续。
rm -f .env.local
npx --yes vercel@65.14.0 blob create-store atlas-history-audio \
  --access public --region iad1 --environment development --yes \
  --scope chris-projects-41eb6ac7
rm -f .env.local
cd "$SRC"
```

核对store ID、项目关联、public访问、hostname和环境。把同一获批hostname写进**窄发布scope和 `src/audio_scope.json` 两处blobHost**；组装使用总scope，只改窄scope会导致正式构建硬失败。不得借用其他项目store。

写凭据只经环境变量传给上传进程，不进Git/HTML/manifest/argv/日志。不要打印env文件；不要声称CLI从不落盘。网页没有写凭据，也不需要Function、数据库或新音频域名。

上传工具使用 `@vercel/blob@2.4.0`、RW token、`multipart:false`。它是本地开发依赖，不进网页；不借CLI默认多段上传虚增操作数。

## 操作模板（以下在 project-files/ 下；命令示例保留早期27段专题范围，不是当前执行授权）

当前全书库是 `policy3-v123-r29`，冻结源和工具在 `work/v35/audio_runs/v123-final-source`（`323f2d3`）：v123 史前与古希腊23站83幕新增98段＋改文重录76段共174段（165段新合成、9段挪编号人物卡缓存复用），证据在 `work/v35/audio_runs/v123-final/`；此前 `ddc5f50` 与演练冻结 `b52951a`（`v123-dryrun/`）均未合成。上一版 v122 的库是 `policy3-v122-r28`，冻结源和工具在 `work/v35/audio_runs/v122-final-source`（`1e5b9e3`）：v122 新增75段＋改文重录4段共79段（二战支线66段、专题15共4段、日本线5新增＋4重录），证据在 `work/v35/audio_runs/v122-final/`；此前首稿 `4aa7d0d`（库 r27，`v122-review/`）和 `a942ebd` 作废，均未合成。上一版 v121 的库是 `policy3-v121-r26`，冻结源和工具在 `work/v35/audio_runs/v121-final-source`（`68e74ed`）：v121 新增日本主线123段，证据在 `work/v35/audio_runs/v121-final/`；其前一个冻结提交 `e8414c0`（库 r25，`v121-japan/`，122段）被复核退回，只做了离线准备、未合成。上一版 v120 的库是 `policy3-v120-r24`，冻结源 `work/v35/audio_runs/v120-final-source`（`3b8727a`）：新增中东线一站15段，证据在 `work/v35/audio_runs/v120-final/`；其前一个冻结提交 `40d8c0b`（库 r23，`v120-qajar/`）只做了离线准备、未合成。上一版 v119 的库是 `policy3-v119-r22`，冻结源 `work/v35/audio_runs/v119-release-source`（`c5e369e`）：新增豆腐块1段，证据在 `work/v35/audio_runs/v119-release/`；此前两个冻结提交 `b57ffac`（库 r20，`v119-sealed-train/`）和 `040d82a`（库 r21，`v119-final/`）都被复核退回，只做了离线准备、未合成。上一版 v118 的库是 `policy3-v118-r19`，冻结源 `work/v35/audio_runs/v118-source`（`cd40802`）：只改写了龙门架法兰西一幕里的一句话，重录 `history-gantry-1914/5` 这1段，证据在 `work/v35/audio_runs/v118-france/`。其前一版 v117 的库是 `policy3-v117-r18`，冻结源 `work/v35/audio_runs/v117-final-source`（`d4a4158`），14项的合成选择、窄发布范围和验证结果在 `work/v35/audio_runs/v117-final/`；此前的 `v117-gantry-full/`（`079f4c4`，库 r17）只做了离线准备、未合成。上一轮 v116 的库 `policy3-v116-r16`（冻结源 `v116-final-source`，`cf1d7a0`）的53项窄发布范围和验证结果在 `work/v35/audio_runs/v116-final/`；53段是在 `v116-release/`（`4cd6d85`，库 `policy3-v116-r15`）录成的，cf1d7a0 只在其上改了两条阅读链接标签、朗读文本全同，录音按 inputHash 搬入 r16。更早的 `v116-austria-gantry/`（`099cf63`，库 r14）只做了离线准备、未合成。v115 的库 `policy3-v115-r13`（冻结源 `v115-release-source`，`f59dda2`）、v114 的库 `policy3-v114-r11`（冻结源 `v114-release-source`，`3ac85e5`，运行目录 `v114-release/`、`v114-final-72/`、`v114-discovery-70/`）及此前各库保留。以下r2/27段命令只是历史示例。

每批先在冻结源严格验收，再合入最新正文并组装。来源和pipeline/text/extract/requirements/approved_omissions均固定哈希；live播放器、resolver、组装器的并行修改不应打断TTS。

```sh
PY=../work/v35/audio_poc/.venv/bin/python
LIB=../work/v35/audio_library/v112-policy3-era2-r2
# 本次公开发布仅专题27段；生成selection保持不变，发布scope随后可加host。
SCOPE=../work/v35/audio_runs/v112-era2/scope-topics.json
SELECT=../work/v35/audio_runs/v112-era2/selection-topics.json
```

### 1. 冻结源版本与覆盖选择

只改正式源文件，不手改导出的txt。按图册流程构建/核查，在本地提交定稿内容；流水线拒绝未提交的内容源变化，记录commit及三个内容文件SHA。源文或提取契约变化必须建新素材库，旧库保留。

要新文新声一起上线就暂不推送；正文急需发布可先推，过期声音自动撤下，不冻结整站。

```sh
# 更新总计划（新增幕、专题、线路时）
python3 tools/audio/release.py scope
# 更新明确的制作/发布子范围
python3 tools/audio/release.py scope --scope "$SCOPE"
```

scope是schema1/policy3，含profile、lines、includeTopics、ids和counts。史前/希腊用 `lines:["prehistory","trunk"], includeTopics:false`；仅专题用 `lines:[], includeTopics:true`。龙门架（`history_entries.js` 的 `TREE_GANTRIES`）跨线而不属于任何线路，其各幕不进任何 `routes`，覆盖时在scope里另写 `gantries:["gantry-1914"]` 点名，规划中尚无条目的龙门架不必写。extraIds可加入零散材料。选正文会包含其独立补充/人物和所需节题，共享幕去重。

### 2. 先导出文本，再审查

```sh
python3 tools/audio/pipeline.py prepare --library "$LIB" --selection "$SELECT" --limit 25
# 重复取选择中的下一批；最后要求该选择完整。
python3 tools/audio/pipeline.py validate --library "$LIB" --selection "$SELECT" --complete
```

限定范围仍验证全源结构和所有已准备文件，字段与UTF-8文本须逐字节回算一致；不截断长专题，不删难读外文。`--complete --selection` 是选择完整，不是全书完整。

复核实际文本和retainedMetadata。r1曾因机械删date而误删专题小标题，已在任何TTS前发现；保留r1底稿，新建r2，修正后的160份与独立DOM逐字一致（仅忽略空白，标点也核对）。

老无已明确：人物卡顶栏（`when`/`life`）及历史节、幕的固定年份栏即便偶尔混入非年份文字也一律不读，仅保留专题各幕的副标题。

### 3. 明确选择，分批串行合成

```sh
# dry-run，不向Edge发文字。
"$PY" tools/audio/pipeline.py synthesize --library "$LIB" \
  --selection "$SELECT" --pitch=+0Hz --limit 2
# 获准后才执行，成功项逐条保存；下一批跳过已验收同输入。
"$PY" tools/audio/pipeline.py synthesize --library "$LIB" \
  --selection "$SELECT" --pitch=+0Hz --limit 2 --execute
python3 tools/audio/pipeline.py verify-audio --library "$LIB" \
  --selection "$SELECT" --pitch=+0Hz
```

共用持久audio-cache：输入指纹取实际文本＋生成设置，文件名取MP3字节SHA。正文/补充/人物独立失效，节题单独重录；地图、表格本体、已排除的时间/来源变动不影响声音。人物内部链接改为外链会改变朗读文字，须重核。

每次只有一个生成器；不在合成期间改冻结提取器、输入或selection。真实失败就停，先看ID、日志、failed证据，不盲目重试、不花钱兜底。SDK内部可能重连；报告的networkRequests是逻辑新合成任务数，不是HTTP/WebSocket/长文本分段次数。

验收重查SHA、MP3格式、完整解码和边界时序。老无2026-11-12最新要求：除非整段空白或乱码，一两个词的差异不得阻断整批上线。WordBoundary覆盖差异默认只记 `qualityWarnings`（`machine-checked-with-coverage-warning`），保留原文、原音和真实边界，不逐词请示或无谓重录，也不伪报完全吻合；整段空/完全无关的边界及技术完整性问题仍拒绝。旧“の”的哈希绑定批准收据继续兼容；本次“カーゾン”直接保留原音。它不是语音识别或人工听审；发音、非末段重复/静音等仍可能漏检，listeningReview单列pending。首次换声线/规则先用获准的长专题和特殊字符小批校准。

### 4. 本地预览和真实播放器检查

```sh
PREVIEW=../work/v35/audio_preview/policy3
mkdir -p "$PREVIEW"
python3 tools/audio/release.py manifest --library "$LIB" --scope "$SCOPE" --local \
  --output "$PREVIEW/audio_manifest.json"
python3 tools/audio/release.py check --scope "$SCOPE" \
  --manifest "$PREVIEW/audio_manifest.json" --allow-local --strict
(cd src && python3 assemble.py "../../work/v35/audio_preview/policy3/index.html" \
  --audio-manifest "../../work/v35/audio_preview/policy3/audio_manifest.json")
AUDIO_PLAYER_SMOKE_MANIFEST="$(cd "$PREVIEW" && pwd -P)/audio_manifest.json" \
  python3 tests/run_tests.py verify-audio-player.js --jobs 1
```

本地清单只能在源码树外。预览也查新鲜度和MP3字节，不是后门。正式清单不得有相对文件路径、file URL或localhost。

真实smoke检查所供节题/正文/长专题/独立补充的哈希文件、浏览器时长、seek与桌面/390px。只给专题时不声称检查了历史或人物音频；全160本地清单可覆盖所有类型。它不是逐句听审、手机真机、Safari或锁屏认证。

### 5. 上传新文件，不覆盖旧对象

```sh
HOST='<本项目获批store>.public.blob.vercel-storage.com'
python3 tools/audio/release.py upload --library "$LIB" --scope "$SCOPE" --host "$HOST" --limit 25
```

核对dry-run的选择、数量、总字节后再执行。专用目录取得本项目development环境凭据，清除继承的旧token；路径转为绝对路径，因为env run在CONTROL启动：

```sh
SRC="$(pwd -P)"
CONTROL="$SRC/../work/v35/audio_storage_cli"
LIB="$(cd "$LIB" && pwd -P)"
SCOPE="$(python3 -c 'import pathlib,sys; print(pathlib.Path(sys.argv[1]).resolve())' "$SCOPE")"
env -u BLOB_READ_WRITE_TOKEN npx --yes vercel@65.14.0 --cwd "$CONTROL" \
  env run --environment development -- \
  python3 "$SRC/tools/audio/release.py" upload --library "$LIB" --scope "$SCOPE" \
  --host "$HOST" --limit 25 --execute
```

上传前核对token/store/host一致，只取通过receipt的文件，不glob整个缓存。先查远端是否已有，再按 `audio/v1/<audioHash>.mp3` 单段PUT；禁止覆盖/随机后缀，audio/mpeg、缓存一年。每成功一条就保存ledger，后续只补剩余。

metadata HEAD复用只核大小/MIME/哈希路径，并不重算远端SHA。保证依赖专用store由此不可覆盖流程写入；发现其他工具覆盖过对象，先核远端字节，不盲信ledger。实际重试数另计，不把任务数冒充HTTP次数。

### 6. 清单、检查、提交、上线

```sh
python3 tools/audio/release.py manifest --library "$LIB" --scope "$SCOPE" --host "$HOST"
python3 tools/audio/release.py check --scope "$SCOPE" --strict --remote
npm run build
python3 tests/run_tests.py verify-audio-pipeline.js verify-audio-player.js \
  verify-metro.js verify-metro-keys.js verify-reader-width.js
```

- 只有本次全部上传成功才原子替换公开清单，失败不覆盖旧版。以后多批合并要使用明确的已公开范围，不无意撤掉仍有效的旧资产。
- manifest schema2/policy3；组装从当前源推导canonical tracks，忽略来稿自带的计划；缺的片段也列在计划里，不静默跳段。
- strict/remote是**本次音频发布**门禁：窄scope完整、新鲜、同一获批host，真实HTTP Range/MIME/长度正确。普通build不联网、不读receipt/ledger/token。
- 普通组装过滤陈旧/缺失音频，正文照发。独立人物/补充过期不撤正文；节题缺失只撤节题，播放时以暂缺提示代替前奏，正文照常。非法schema/profile/host/URL/哈希/元数据仍硬失败。
- 未发布正文不展示无用的灰色朗读栏；有正文但已选补充缺失时保留提示。新建/改稿不要求先有TTS。
- 提交播放器、工具、公开manifest及组装index；MP3、素材库、receipt、凭据和本地预览不进Git。顺序必须是 **commit → Bartender sync → 推送房间规范SHA到main → GitHub全量测试 → Vercel Deployment Check → 自动切线上**，不先推agent提交，也不另开绕过门禁的CLI部署。
- 在老无Chrome打开真实本地/线上页面，不拿截图交付；报告实际上传数、commit、CI/部署结果，不能只说“已推送”就称上线成功。

## 同文重录与备份

同文坏录音：确认ID/授权 → 停生成上传 → 备份receipt/state → 把旧receipt移出活跃缓存并移除state中的同inputHash引用 → 保留旧哈希MP3/Blob → 明确 `--only <ID> --execute` → 验证、试听、上传、换清单。返回相同字节仍是原录音，不算改善。不得伪造receipt或弱化检查，其他提供者/人工录音导入另订规则。

Git/Bartender不保存源码树外音频。归档/删除工作区前备份素材、audio-cache/audio、receipts、state与上传ledger。旧policy2的220份（25,339.392秒、152,036,352字节）是历史证据，新规执行记录在 `work/v35/audio_runs/v112-era2/` 和对应BUILD，不相互冒充。

## 套餐边界

官方定价页2026-11-10实读：Hobby含1GB存储、每月10GB Blob下载、2000次高级/10000次简单操作；CDN另按通用规则。超限可能暂停服务，不自动转为付费超额。升级/支出控制另需老无批准。

早期首次公开为27段；当前音频已迁至R2，不能把旧Blob额度或早期冻结全书5284段的计划误当实际账单，也不能据全书文件数要求买Pro。当月剩余额度未核实，也不承诺无限流量免费。建库通常一次高级操作，新单段PUT通常每文件一次；重试和读取/流量另计。

参考：[额度](https://vercel.com/docs/vercel-blob/usage-and-pricing)、[Public Blob](https://vercel.com/docs/vercel-blob/public-storage)、[CLI](https://vercel.com/docs/cli/blob)。当前是否真的建库/上传/部署，以BUILD证据为准。
