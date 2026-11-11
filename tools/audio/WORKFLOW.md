# 音频新增、替换与发布流程

## 已定口径

- 云健 `zh-CN-YunjianNeural`，pitch `+0Hz`、rate/volume `+0%`，网页初始1×。
- 当前policy3：去掉固定位置的纯时间信息，正文年份不动；不读“史料与延伸阅读”或人物外链文字。**专题date实际是副标题**，不是年代，必须保留。非时间/混合标签列在retainedMetadata供复核，细则见 [README.md](README.md)。
- 每幕一份正文、节题另作前奏；每题一份完整专题正文；每则名场面、豆腐块和人物卡各自一份。两项“包括补充趣事”“包括人物小传”默认关闭，整张人物卡的小事/生平归人物组。
- 播放顺序：节题（需要时）→正文→勾选趣事→勾选人物。专题补充接在整题正文之后。勾选的趣事与人物小传作为独立条目列入播放列表，前奏不占行；朗读前与播放中均可切换，只影响未经过的片段。
- 浏览和播放独立；连续朗读冻结真实整线（包括点击幕之前的幕），到尾停止、不循环。未齐全的所选内容不能跳过；缺未选补充不影响正文。

### 计划、制作选择、公开范围必须分开

v112的总计划 `src/audio_scope.json` 仍含史前、希腊、罗马至 `history-empire-west-end/6` 和全部专题，按新分段共497项。末幕原稿日期“476年以后”是西罗马灭亡一节的后果总结，不续读东哥特/东罗马。

**总计划不等于默认授权。** 首批分两阶段获准完成：先做史前/希腊133段与14专题（27段），经审阅确认清理规则后再补齐罗马337段，合计497/497段（491个唯一MP3文件）全部上线。后续部分制作/发布仍可另建窄scope；普通构建始终支持部分嵌入，不因未录线路阻塞改稿。

## 一次性托管接入

2026-11-10只读核实：项目 `history-of-europe-in-frames`（`prj_PLQed0U7rWBL6Eof03Ip4ujUmyPY`），团队 `chris-projects-41eb6ac7`（`team_P7zO50QeJs79fz0JZgYKQiUp`），**Hobby/active**；接入前没有关联Blob store。

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

## 日常操作（以下在 project-files/ 下）

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

scope是schema1/policy3，含profile、lines、includeTopics、ids和counts。史前/希腊用 `lines:["prehistory","trunk"], includeTopics:false`；仅专题用 `lines:[], includeTopics:true`。extraIds可加入零散材料。选正文会包含其独立补充/人物和所需节题，共享幕去重。

### 2. 先导出文本，再审查

```sh
python3 tools/audio/pipeline.py prepare --library "$LIB" --selection "$SELECT" --limit 25
# 重复取选择中的下一批；最后要求该选择完整。
python3 tools/audio/pipeline.py validate --library "$LIB" --selection "$SELECT" --complete
```

限定范围仍验证全源结构和所有已准备文件，字段与UTF-8文本须逐字节回算一致；不截断长专题，不删难读外文。`--complete --selection` 是选择完整，不是全书完整。

复核实际文本和retainedMetadata。r1曾因机械删date而误删专题小标题，已在任何TTS前发现；保留r1底稿，新建r2，修正后的160份与独立DOM逐字一致（仅忽略空白，标点也核对）。

混合字段“前2世纪 · 安息国王”“1456年平反—1920年封圣”不在本轮；做到对应线路前问老无，不能默认读，也不能把身份/事件说明整行静默删掉。

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

验收重查SHA、MP3格式、完整解码、WordBoundary文字/时间/尾部。它不是语音识别或人工听审；发音、非末段重复/静音等仍可能漏检，listeningReview单列pending。首次换声线/规则先用获准的长专题和特殊字符小批校准。

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
- 普通组装过滤陈旧/缺失音频，正文照发。独立人物/补充过期不撤正文；节题缺失会撤依赖它的历史音频。非法schema/profile/host/URL/哈希/元数据仍硬失败。
- 未发布正文不展示无用的灰色朗读栏；有正文但已选补充缺失时保留提示。新建/改稿不要求先有TTS。
- 提交播放器、工具、公开manifest及组装index；MP3、素材库、receipt、凭据和本地预览不进Git。推main后走现有 **GitHub全量测试 → Vercel Deployment Check → 自动切线上**，不另开绕过门禁的CLI部署。
- 在老无Chrome打开真实本地/线上页面，不拿截图交付；报告实际上传数、commit、CI/部署结果，不能只说“已推送”就称上线成功。

## 同文重录与备份

同文坏录音：确认ID/授权 → 停生成上传 → 备份receipt/state → 把旧receipt移出活跃缓存并移除state中的同inputHash引用 → 保留旧哈希MP3/Blob → 明确 `--only <ID> --execute` → 验证、试听、上传、换清单。返回相同字节仍是原录音，不算改善。不得伪造receipt或弱化检查，其他提供者/人工录音导入另订规则。

Git/Bartender不保存源码树外音频。归档/删除工作区前备份素材、audio-cache/audio、receipts、state与上传ledger。旧policy2的220份（25,339.392秒、152,036,352字节）是历史证据，新规执行记录在 `work/v35/audio_runs/v112-era2/` 和对应BUILD，不相互冒充。

## 套餐边界

官方定价页2026-11-10实读：Hobby含1GB存储、每月10GB Blob下载、2000次高级/10000次简单操作；CDN另按通用规则。超限可能暂停服务，不自动转为付费超额。升级/支出控制另需老无批准。

本次公开27段，不是旧全书2462或新目录5284段，不能据全书文件数要求买Pro。当月剩余额度未核实，也不承诺无限流量免费。建库通常一次高级操作，新单段PUT通常每文件一次；重试和读取/流量另计。

参考：[额度](https://vercel.com/docs/vercel-blob/usage-and-pricing)、[Public Blob](https://vercel.com/docs/vercel-blob/public-storage)、[CLI](https://vercel.com/docs/cli/blob)。当前是否真的建库/上传/部署，以BUILD证据为准。
