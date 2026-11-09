// rules.mjs — 分类规则库（长期维护点：新增站点优先在这里加规则或介绍）
// 三类规则：EXCLUDE（排除）、DESC（已知站点介绍）、RULES（域名→分类路径）

// ── 排除规则 ─────────────────────────────────────────────
export const EXCLUDE_DOMAINS = [
  // 成人内容（用户拍板完全排除）
  'xvideos.com', 'thumbzilla.com', 'xhamster.com', 'missav.ai', 'missav.com',
  'missav.ws', 'pornhub.com', 'xnxx.com', 'spankbang.com', 'xhamster.one',
  'xhamster.desi', 'porn300.com', 'primepornlist.com', 'javbangers.com',
  'javmost.com', 'javhd.com', 'jable.tv', 'netflav.com', 'supjav.com',
  'sextb.net', 'txxx.com', 'upornia.com', 'hclips.com', 'hotmovs.com',
  'porn.com', 'redtube.com', 'youporn.com', 'tube8.com', 'mofosex.com',
  'motherless.com', 'eporner.com', '4tube.com', 'tmohentai.com',
  'm.youtube.com', // 由 youtube.com 规则接管，避免重复（m. 域名归一后不会出现，保险）
  // 本地 / 内网（公开站无意义）
  'localhost', '127.0.0.1', '192.168.0.100', '192.168.1.1', '10.0.0.1',
];

// URL 含这些关键词 → 排除（成人站点镜像/路径）
// 注意: 不收 'sex' 裸词——vuejsexamples.com 等正常站会被子串误杀, sex 由独立词正则判断
export const EXCLUDE_URL_PARTS = [
  'xvideos', 'thumbzilla', 'xhamster', 'pornhub', 'xnxx', 'missav',
  'spankbang', 'redtube', 'youporn', 'jable', 'netflav', 'supjav',
  'javmost', 'javbangers', 'porn', 'nsfw', 'hentai', 'onlyfans',
  'erome', 'motherless', 'eporner', 'camwhores', 'thisvid', 'rule34',
  'nhentai', 'exhentai', 'e-hentai', 'hanime', 'iroots', 'avgle',
  'pornone', 'txxx', 'upornia', 'hclips', 'hotmovs', 'beeg',
  'seajav', 'javdb.com', 'javdb', 'justpaste.it/ks20u',
  // 二轮补充：漏网成人站
  '18av.mm-cg.com', '66kkhh.com', 'avhub.vercel.app', 'bbxx55.com', 'ggjav.com',
  'onlyrank.lol', 'hohoj.tv', 'haoshangle.com', 'onlyfans.com', 'mm-cg.com',
  'swag.live', 'onejav', 'sukebei', 'handbrake', 'friday-65c', 'yinmm',
  // 三轮补充
  'chgal.com', 'cospuri.com', '1337x.to', 'v.bxkp.org', 'dc.hhhl.cc',
  // 四轮：漏网成人/擦边
  '123av.com', 'hsck1.25img.com', 'wantav.com', 'lijav.com', 'nowav.tv',
  '100xx.xx.kg', 'xiangjiaozyw.com', 'bokepinaja.com', 'i8k.tv', '1024tools.com',
  // 五轮：成人残留
  'x.91sheshe.com', '91sheshe.com', 'ajianpingce.com',
  // 六轮：最终漏网
  'javhub.me', '113da.com', 'blacked.com', 'cum4k.com', 'tubewolf.com',
  'xbabe.com', 'youjizz.com', 'stripchat.com', '1377x.to', 'sexinsex.net',
];

// sex 作为独立词出现才排除（vuejsexamples 不命中，sex.com / /sex/ 命中）
export function urlHasSexKeyword(url) {
  return /(^|[^a-z])sex([^a-z]|$)/.test(url.toLowerCase());
}

// 标题命中 → 排除（URL 规则抓不到的成人站）
export const EXCLUDE_TITLE = /無碼|无码|有码|成人影片|成人AV|大香蕉|伊人在线|a片|A片|OnlyFans|色情|情色|R18|H成人|免费AV|在线看片|撸|炮|援交|种子.*XXX|XXX.*种子|不想看片|Erotica|Nude|porn/i;

  // 文件夹路径含这些词 → 排除（用户的「私人」目录及子夹）
export const EXCLUDE_FOLDERS = ['私人', 'xvideos-', 'thumbzilla', 'xhamster', '欧美站', '日系AV', 'AI成人'];

// URL 主机是内网/本地 IP 段
export function isLocalHost(h) {
  return /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || /^\d+\.\d+\.\d+\.\d+$/.test(h);
}

// ── 已知站点介绍库（域名 → 中文一句话介绍）───────────────
export const DESC = {
  // AI
  'chatgpt.com': 'OpenAI 官方 ChatGPT 对话助手',
  'openai.com': 'OpenAI 官网，GPT 系列模型与 API',
  'claude.ai': 'Anthropic Claude 对话助手',
  'gemini.google.com': 'Google Gemini 多模态 AI 助手',
  'aistudio.google.com': 'Google AI Studio，Gemini 模型在线调试与 Prompt 实验',
  'qianwen.com': '阿里通义千问对话',
  'tongyi.aliyun.com': '阿里通义千问大模型',
  'kimi.moonshot.cn': '月之暗面 Kimi 长文本对话助手',
  'deepseek.com': '深度求索 DeepSeek 大模型',
  'chat.deepseek.com': 'DeepSeek 官方对话',
  'platform.deepseek.com': 'DeepSeek 开放平台与 API',
  'openrouter.ai': '聚合各家大模型的统一 API 网关与中转',
  'openrouter.icu': 'OpenRouter 相关中转服务',
  'lmarena.ai': '大模型匿名对战排行榜（原 LMSYS Arena）',
  'huggingface.co': '全球最大 AI 模型与数据集托管社区',
  'producthunt.com': '新产品发现与发布社区',
  'toolify.ai': 'AI 工具导航目录，收录量大',
  'aidirectori.es': 'AI 工具目录站',
  'goodaitools.com': '优质 AI 工具精选目录',
  'openart.ai': 'AI 图像生成平台，多模型聚合',
  'midjourney.com': '知名 AI 绘画工具 Midjourney',
  'perplexity.ai': 'AI 搜索引擎，带来源引用',
  'github.com': '全球最大代码托管平台',
  'raw.githubusercontent.com': 'GitHub 原始文件直链访问',
  'gitee.com': '国内代码托管平台码云',
  'stackoverflow.com': '程序员问答社区',
  'csdn.net': '国内最大程序员博客社区',
  'cnblogs.com': '博客园，国内技术博客社区',
  'juejin.cn': '掘金，中文技术社区',
  'zhihu.com': '知乎问答社区',
  'bilibili.com': 'B站，视频弹幕网站',
  'youtube.com': '全球最大视频平台',
  'reddit.com': '国际版论坛聚合社区',
  'discord.com': '语音与社区聊天工具',
  'x.com': 'X（原 Twitter）',
  'twitter.com': 'Twitter 社交平台',
  'v2ex.com': '创意工作者社区',
  '52pojie.cn': '吾爱破解，国内逆向与软件技术论坛',
  // 开发 / 前端
  'npmjs.com': 'Node.js 包注册表',
  'codepen.io': '前端代码在线演示平台',
  'codesandbox.io': '在线全栈开发沙盒',
  'arco.design': '字节跳动 Arco Design 组件库',
  'ant.design': '蚂蚁金服 Ant Design 组件库',
  'element-plus.org': 'Vue 3 组件库 Element Plus',
  'vuejs.org': 'Vue.js 官方文档',
  'cn.vuejs.org': 'Vue.js 中文官方文档',
  'vitejs.dev': 'Vite 构建工具官方文档',
  'cn.vitejs.dev': 'Vite 中文官方文档',
  'vitepress.dev': 'VitePress 静态站点生成器',
  'react.dev': 'React 官方文档',
  'nodejs.org': 'Node.js 官网',
  'developer.mozilla.org': 'MDN Web 文档，Web 技术权威参考',
  'caniuse.com': '浏览器兼容性查询',
  'docs.qq.com': '腾讯文档在线协作',
  'mubu.com': '幕布大纲笔记',
  'my.feishu.cn': '飞书文档与协作',
  'notion.so': 'Notion 笔记与知识库',
  // 云 / 基建
  'cloudflare.com': 'Cloudflare CDN 与安全服务',
  'dash.cloudflare.com': 'Cloudflare 控制台',
  'aliyun.com': '阿里云',
  'developer.aliyun.com': '阿里云开发者社区',
  'console.bce.baidu.com': '百度智能云控制台',
  'portal.azure.com': 'Microsoft Azure 控制台',
  'console.aws.amazon.com': 'AWS 控制台',
  // 工具
  'fanyi.baidu.com': '百度翻译',
  'translate.google.com': '谷歌翻译',
  'deepl.com': 'DeepL 高质量翻译',
  'seostudio.tools': 'SEO 与文本工具合集',
  'ip.sb': 'IP 查询',
  // 购物 / 发卡
  'shop.777faka.com': '777 发卡平台商户面板',
  'payhip.com': '数字商品销售平台',
  // 导航
  'fmhy.net': 'freemediaheckyeah，互联网免费资源大全（本站参考原型）',
  'baipiao.org': '白嫖奖，羊毛与优惠信息',
  'nodeloc.com': '节点论坛，机场测评与网络交流',
  'linux.do': 'LINUX DO 论坛，资源与技术交流社区',
  'right.com.cn': '恩山无线论坛，路由器技术社区',
  'hostloc.com': '全球主机交流论坛，VPS 圈核心社区',
  'nodeseek.com': 'NodeSeek 主机论坛',
  'quark.cn': '夸克网盘',
  'pan.quark.cn': '夸克网盘网页版',
};

// ── 分类规则：正则(域名) → 分类路径 ───────────────────────
// 顺序即优先级，先命中先归类。cat = ['一级', '二级']
export const RULES = [
  // AI
  [/^(chatgpt\.com|openai\.com|claude\.ai|gemini\.google\.com|aistudio\.google\.com|qianwen\.com|tongyi\.aliyun\.com|kimi\.moonshot\.cn|deepseek\.com|chat\.deepseek\.com|poe\.com|poe\.ai|you\.com|copilot\.microsoft\.com|chat\.mistral\.ai|grok\.com|x\.ai|qwen\.ai|baichuan-ai\.com|sensecore\.cn|spark\.xfyun\.cn|yiyan\.baidu\.com|huggingface\.co|lmarena\.ai|groq\.com|together\.ai|siliconflow\.cn|siliconflow\.com)$/, ['AI 工具', '对话与模型']],
  [/^(chatglm\.cn|bigmodel\.cn|dashscope\.aliyun\.com|openrouter|bltcy|svips|mirbuds|aabao|vcnovb|jf449|jif9|yfjc|tingfengai|freeapi|api\.bltcy|api\.svips|gpt\.mirbuds|nezhasoft|nicecc)/i, ['AI 工具', 'API 与中转站']],
  [/^(openart\.ai|midjourney\.com|leonardo\.ai|ideogram\.ai|stable-diffusion|civitai\.com|liblib\.ai|tencent\.com.*draw|aipromptgenerator|prompt|krea\.ai|flux)/i, ['AI 工具', '生成与创作']],
  [/^(toolify\.ai|aidirectori\.es|goodaitools\.com|futuretools|theresanaiforthat|ai-nav|ai\.coze|gpts)/i, ['AI 工具', '导航与目录']],
  // AI 目录/导航/比价/榜单类（二轮扩充）
  [/^(ahy\.ai|aig123|ainavtool|aitoolslist|aixcollection|dir2ai|foundr\.ai|hao\.logosc|indexof\.ai|neeed|similarlabs|toptools\.ai|citablehub|aihuntlist|aibase|top\.aibase|hugai|veridrop|2233\.ai|aibijia|atomwords|empero|bewild|pollinations| Station|station\.hugai|llmperks|tokenharbor|atlascloud|hix\.ai|photogpt|image-editor|nqz\.ai|openprice|seedance|jian27|rexdl)/i, ['AI 工具', '导航与目录']],
  // 产品发现/发布/榜单平台
  [/^(producthunt|launchzone|launchnest|sololaunches|saasgrave|codehype|gitwatt|atomgit|chanpinpai|momoyu|trendingdevtools|unitelist|huntfortools|ravesoftwaresearch|appinn|小众软件)/i, ['资源导航', '产品发现']],
  // 开发
  [/^(github\.com|raw\.githubusercontent|gitee\.com|gitlab\.com|bitbucket\.org)/, ['开发', '代码托管']],
  [/^(developer\.mozilla|stackoverflow|npmjs|caniuse|devdocs|runoob|w3school|vuejs|cn\.vuejs|vitejs|cn\.vitejs|vitepress|react|nextjs|nuxt|nodejs|typescriptlang|javascript\.info|web\.dev)/, ['开发', '文档与教程']],
  [/^(arco\.design|ant\.design|element-plus|naiveui|vant-ui|ui\.admin|tailwindcss|daisyui|shadcn|headlessui|chart\.js|echarts|apache\.org.*echarts|antv|g2plot|d3js)/, ['开发', '前端生态']],
  [/^(52pojie\.cn|chromium|chrome-extension|greasyfork|tampermonkey|crack|reverse|ida|ghidra|看雪|pediy)/, ['开发', '逆向与安全']],
  [/^(csdn\.net|cnblogs\.com|juejin\.cn|segmentfault|v2ex\.com|blog\.)/, ['开发', '博客与社区']],
  // 网络
  [/^(机场|订阅|订阅转换|sub\.|sub-|subweb|clash|mihomo|v2ray|shadowrocket|surge|sing-box|nodeloc|nodefree|节点|免费节点|lmspeed)/, ['网络', '机场与节点']],
  [/^(ip\.sb|ipip|ipinfo|speedtest|fast\.com|测速|itdog|ping|ping\.pe|whois|dns|mxtool)/, ['网络', '测速与查询']],
  // 账号服务
  [/^(temp-?mail|10minutemail|guerrillamail|临时邮箱|24mail|linshiyouxiang|moakt|mailnesia|tempmail)/, ['账号服务', '临时邮箱']],
  [/^(接码|sms|sms-?activate|5sim|smshub|onlinesim|receive-?sms)/, ['账号服务', '接码与短信']],
  [/^(发卡|faka|777faka|shop\.|duopin|独角数卡|异次元发卡|acg\.fyi|22\.do|sdcb|pay|payment|stripe|alipay|epusdt)/, ['账号服务', '发卡与支付']],
  // 工具
  [/^(pdf|pdftoword|ilovepdf|smallpdf|pdf24|格式转换|convert|cloudconvert|convertio)/, ['实用工具', '格式转换']],
  [/^(translate|translate\.google|deepl|fanyi|翻译|lingva)/, ['实用工具', '翻译']],
  [/^(tool|tools|在线工具|文本|text-?repeater|正则|regex|json|格式化|beautifier|minifier|cron|时间戳)/, ['实用工具', '在线工具']],
  // 影音
  [/^(youtube\.com|youtu\.be|bilibili\.com|b23\.tv|douyin\.com|youtube|nunflix|影视|电影|美剧|动漫|anime|movie|tvbox)/, ['影音媒体', '影视与视频']],
  [/^(music|spotify|网易云|音乐|netease|qq\.com.*music|last\.fm|apple\.com.*music)/, ['影音媒体', '音乐']],
  [/^(pan\.|网盘|quark|aliyundrive|alipan|123pan|123684|lanzou|蓝奏|百度网盘|pan\.baidu|onedrive|mega\.nz|gofile|pixeldrain|catbox|moe)/, ['影音媒体', '网盘与存储']],
  [/^(apk|apkpure|apkcombo|安卓|android|appstore|play\.google)/, ['安卓', 'APK 与应用']],
  // 社区
  [/^(linux\.do|hostloc|nodeseek|right\.com\.cn|reddit|discord|t\.me|telegram|x\.com|twitter)/, ['社区论坛', '国际社区']],
  [/^(zhihu|tieba|weibo|douban|百度贴吧|豆瓣|微博|nga|虎扑|少数派|sspai)/, ['社区论坛', '中文社区']],
  // 资讯 / 导航
  [/^(fmhy|baipiao|什么值得买|smzdm|羊毛|优惠|薅|free|freebies|deals|会员|白嫖)/, ['资源导航', '羊毛与优惠']],
  [/^(blog|博客|newsletter|medium\.com|substack|sspai)/, ['资讯博客', null]],
  [/^(007tg|social|流量|tg|telegram)/, ['营销工具', '流量与推广']],
  [/^(temp|tempmail|etempmail|smailpro|临时号码|temp-?number|tmpmail|mail\.tm|mailtemp|临时邮箱)/, ['账号服务', '临时邮箱']],
  [/^(bejson|tool\.oschina|在线工具|json\.cn|tooltt|textcompare|菜鸟)/, ['实用工具', '在线工具']],
  [/^(btmayi|磁力|bt|torrent|cili|种子)/, ['影音媒体', '磁力与下载']],
  [/^(chongbuluo|虫部落|search|搜索引擎|seek)/, ['资源导航', '搜索引擎']],
  [/^(likebookmark|书签|bookmark|nav|daohang|导航|directory)/, ['资源导航', '导航站']],
  [/^(datav|antv|echarts|图表|chart)/, ['开发', '前端生态']],
  [/^(fishpi|摸鱼|社区|bbs|forum|discourse)/, ['社区论坛', '综合']],
  [/^(earnably|赚|撸毛|任务|reward|悬赏)/, ['资源导航', '羊毛与优惠']],
  [/^(appinn|小众软件|qijishow|奇迹秀|设计|design|ui|uii|配色|patterncraft|icons|图标|字体|font)/, ['开发', '设计与素材']],
  [/^(idx\.google|firebase|studio|ide|editor|codesandbox|codepen|replit|glitch)/, ['开发', '在线 IDE']],
  [/^(tikhub|apihub|数据|dataset|爬虫|crawler|scraper|spidertools)/, ['开发', '数据与爬虫']],
  [/^(kali|渗透|pentest|hacktool)/, ['开发', '逆向与安全']],
  [/^(2captcha|captcha|打码)/, ['账号服务', '接码与短信']],
  [/^(mmbrowser|候鸟|指纹|antidetect|反检测|关联)/, ['账号服务', '指纹浏览器']],
  [/^(jiemahao|解码|解密|jm)/, ['实用工具', '在线工具']],
  [/^(xiwnn|钢琴|piano|游戏|game|模拟器)/, ['实用工具', '休闲小工具']],
  [/^(drive\.google|onedrive|dropbox|sendspace|filebin)/, ['影音媒体', '网盘与存储']],
  [/^(groq|playground|console\.groq)/, ['AI 工具', '对话与模型']],
  [/^(intel|驱动|driver)/, ['实用工具', '系统与驱动']],
  [/^(brevo|邮件营销|newsletter|mailchimp)/, ['营销工具', '邮件服务']],
  [/^(eu\.org|freedns|免费域名|nic\.)/, ['云与基建', '免费域名']],
  [/^(airforce\.com|usaf|gov|政府)/, ['待整理', null]],
  // 三轮：杂项归位
  [/^(alternativeto|besttoolvault|softpedia|majorgeeks|filehorse)/, ['资源导航', '软件发现']],
  [/^(ruancang|软仓|axutongxue|阿虚|软件下载|download\.|绿色软件)/, ['资源导航', '软件下载']],
  [/^(getfreeproxy|freeproxy|proxy-?list|trojan|免费代理)/, ['网络', '免费节点']],
  [/^(fragment\.com|ton|trustpilot)/, ['云与基建', '其他']],
  [/^(iloveimg|tinypng|compress|图片压缩|image|图片)/, ['实用工具', '图片工具']],
  [/^(markdown|md-editor|mdeditor)/, ['实用工具', '在线工具']],
  [/^(ldprompt|prompt|提示词)/, ['AI 工具', '提示词']],
  [/^(aichatonline|chatfreely|chat\.chatgptplus|freegpt|免登录)/, ['AI 工具', '对话与模型']],
  [/^(platinmods|rexdl|leeapk|modapk|破解apk|paidapk)/, ['安卓', 'APK 与应用']],
  [/^(disboard|discord.*server|服务器列表)/, ['社区论坛', '国际社区']],
  [/^(ebesucher|赚钱|冲浪赚钱|traffic|挂机)/, ['营销工具', '流量与推广']],
  [/^(fastlaunch|submitmatic|startup|创业|independent)/, ['资源导航', '产品发现']],
  [/^(krackpot|bitcoin|btc|puzzle|加密货币)/, ['待整理', null]],
  [/^(itsk|IT天空|系统封装|驱动)/, ['实用工具', '系统与驱动']],
  [/^(superdesign|design|dev)/, ['开发', '设计与素材']],
  // 四轮：长尾大簇
  [/^(chat-|chat1|chatnio|veloera|oneapi|new-?api|teamorouter|agentrouter|anyrouter|router|relay|中转|lambda\.chat|open\.maic|ffa\.chat|easychat|dafreeai|g4f|freegpt|getgpt|claudechn|supercluai|getfre|myai\.asia|infip|oaichat|shy521|wr\.do|aih\.lat|ubfgho|passwall|bcloud|ml\.jf449|linjinpeng)/, ['AI 工具', '中转与免费API']],
  [/^(it-tools|uutils|lzltool|qtool|manytools|1024tools|acidtools|imyshare|weliketools|he tool|ol\.|toolbox|工具箱)/, ['实用工具', '在线工具']],
  [/^(zhibo8|jrszhibo|feisuzhibo|24kanqiu|nba01|直播|zhibo|体育|sport|nba)/, ['影音媒体', '直播与体育']],
  [/^(figma|iconfont|pixlr|mobbin|cherrycss|canva|photopea|dribbble|behance)/, ['开发', '设计与素材']],
  [/^(hub\.docker|docker|railway|zeabur|claw\.cloud|kittycloud|render\.com|fly\.io|vercel|netlify|deploy|部署)/, ['云与基建', '部署平台']],
  [/^(packetstream|traffmonetizer|paidwork|hustle|bytebenefit|passive|income|挂机赚钱|薅美元)/, ['营销工具', '被动收入']],
  [/^(csdiy|studycpp|nengzili|tuostudy|opencompass|学习|course|课程|大学|mooc)/, ['资源导航', '学习资源']],
  [/^(savefrom|vidnest|filemoon|mixdrop|doodstream|解析|download.*video|视频下载)/, ['影音媒体', '视频解析与下载']],
  [/^(tgstat|fragment|telemetr|tg机器人)/, ['社区论坛', 'Telegram']],
  [/^(locyanfrp|frp|内网穿透|tunnel|隧道|dnshe|pp\.ua)/, ['云与基建', '内网穿透']],
  [/^(vueuse|madewithvuejs|vuecomponents|vue3-admin|next\.antdv|posva|vue\.|pinia|router\.vuejs)/, ['开发', '前端生态']],
  [/^(okx|binance|coin|biyou|加密|数字货币|bitcoin|btc|eth|web3|rootdata)/, ['资源导航', '加密货币']],
  [/^(awesomeindie|indiehacker|builtbyindies|gumroad|fazier|uneed|tdirectory|directories|launch|independent)/, ['资源导航', '产品发现']],
  [/^(jsdelivr|unpkg|cdnjs|cdn|staticfile)/, ['开发', 'CDN 与静态资源']],
  [/^(obsproject|obs|录屏|stream)/, ['实用工具', '系统与驱动']],
  [/^(windy|weather|天气|map|地图)/, ['实用工具', '地图与天气']],
  [/^(bing|google\.com|搜索|search\.)/, ['资源导航', '搜索引擎']],
  [/^(ycombinator|news\.ycom|daniweb|dev\.to|hacker)/, ['开发', '博客与社区']],
  [/^(mp\.weixin|公众号|微信|weixin)/, ['社区论坛', '中文社区']],
  [/^(shopify|gname|聚名|域名注册|namesilo)/, ['云与基建', '云服务与域名']],
  [/^(zkaq|漏洞|vuln|ctf|安全|shegongku|社工)/, ['开发', '逆向与安全']],
  [/^(bulianglin|不良林|cheshirex|代理|梯子)/, ['网络', '机场与节点']],
  [/^(amz123|亚马逊|跨境电商|doosho|电商)/, ['购物电商', '跨境电商']],
  [/^(iherb|海淘|购物|淘宝|京东|suning|优惠)/, ['购物电商', '电商']],
  [/^(terabox|闲鱼|transfer\.it|临时文件|file)/, ['影音媒体', '网盘与存储']],
  // 五轮：长尾收编
  [/^(磁力|cili|bt|skrbt|dmhy|tracker|btdig|老王|吴签|无限磁力|1lou|1207|btapp|btlms|cilido)/, ['影音媒体', '磁力与下载']],
  [/^(ubfgho|bfgho|bfxitong|淘宝|天猫|京东|唯品会|聚划算|携程|爱淘宝)/, ['购物电商', '电商']],
  [/^(futurepedia|funfun|aitoolfame|appsytools|featuredtool|turbo0|uno\.|newtool|stackdirectory|productlistdir|theapptools|softwareontheweb|aigotools|digitool|futuretools)/, ['AI 工具', '导航与目录']],
  [/^(图床|imgchr|bigshare|pikshare|16图床|chevereto|freeimage|postimages)/, ['实用工具', '图床']],
  [/^(文本|去重|加密|jwt|2fa|验证码|端口|packer|iamwawa|qqxiuzi|box3|encrypt|gptkong|audiotrimmer|docpe|upscale|yaseo|音频|mp3)/, ['实用工具', '在线工具']],
  [/^(果核|ghxi|macat|hapnext|装机|破解软件|绿色|软件站|altapps|pcdalife|软仓)/, ['资源导航', '软件下载']],
  [/^(crx|扩展|extension|chrome\.|极简插件)/, ['开发', '浏览器扩展']],
  [/^(导航|收录|dh|noisedh|sjsdhw|martinku|mr41|bigezhang|1sl|kjgx|wwa3|zhcndoc|soali|geekshare|qiqu|杂铺|sh\.tmioe|shareduck|bccfxs|webjike)/, ['资源导航', '导航站']],
  [/^(公益|免费chatgpt|aitianhu|wenxiaobai|问小白|hunyuan|混元|siliconflow|notebooklm|nextchat|sodu|ghostbot|rawchat)/, ['AI 工具', '对话与模型']],
  [/^(雨果|cifnews|tktoc|tk跨境|tiktok|tk1688|shopee|跨境电商|亚马逊|amz)/, ['购物电商', '跨境电商']],
  [/^(acg|游戏|game|内测|quantum|lzacg|shinnku|acgyyg|aiwan|3dm|游民)/, ['游戏', '游戏资源']],
  [/^(搬书匠|电子书|ebook|易知|课程|学习|高校|srgaoxiao|banshujiang|yizhiknow)/, ['资源导航', '学习资源']],
  [/^(dogesms|hero-sms|topstip|sms|接码)/, ['账号服务', '接码与短信']],
  [/^(副业|hustle|esidehustles|gemsloot|addslice|packetstream|traffmonetizer|赚钱|收益)/, ['营销工具', '被动收入']],
  [/^(bunny|enumhq|submission|whatlaunched|webspot|ufind|saascity|saasfield|fazier|builtbyindies|awesomeindie|indiehacker|sharedata)/, ['资源导航', '产品发现']],
  [/^(v2b|pp\.st|cloudupup|xiyou|swywl|lovetoshare|passwall|569cloud|加速|梯子|机场)/, ['网络', '机场与节点']],
  [/^(cloudflare|dash\.|console\.|oss\.|volcengine|aliyun|腾讯云|面板|dashboard|仪表盘|gateway|adapter|kookeey|jingfan|onelighter|denxio|shy521|xqc\.best|mjc\.cam|qyhever|xmdbd|int\.yt)/, ['云与基建', '控制台与面板']],
  [/^(tgstat|telegram|t\.me)/, ['社区论坛', 'Telegram']],
  [/^(ipaddr|ippure|ip\.|纯真|ip查)/, ['网络', '测速与查询']],
  [/^(rebang|热榜|newsnow|资讯|news|早报)/, ['资讯博客', null]],
  [/^(figma|设计|shejibaozang|素材|91she|字体|u159|icon)/, ['开发', '设计与素材']],
  [/^(run\.claw|clawcloud|900\.cool|静态.*托管|托管|hosting|googiehost|zeabur|railway)/, ['云与基建', '部署平台']],
  [/^(phind|perplexity|answer|问答)/, ['AI 工具', '对话与模型']],
  [/^(zkaq|黑客|hack|安全|渗透)/, ['开发', '逆向与安全']],
  [/^(spiderbox|爬虫|逆向资源)/, ['开发', '数据与爬虫']],
  [/^(xqbase|象棋|棋|game.*chess)/, ['实用工具', '休闲小工具']],
  [/^(hifleet|船|ship|ais)/, ['实用工具', '地图与天气']],
  [/^(tjweather|atmos|weather|天气)/, ['实用工具', '地图与天气']],
  [/^(ldcstore|积分|兑换|linuxdo)/, ['社区论坛', '综合']],
  [/^(fmhy|changes\.fmhy)/, ['资源导航', '导航站']],
  [/^(lace|bandlab|音乐|music)/, ['影音媒体', '音乐']],
  [/^(airforce|usaf)/, ['其他', null]],
  // 六轮：常见大站与漏网
  [/^(baidu\.com|sogou|so\.com|yandex)/, ['资源导航', '搜索引擎']],
  [/^(facebook\.com|business\.facebook)/, ['社区论坛', '国际社区']],
  [/^(echanpin|btdig|en\.btdig|torrent)/, ['影音媒体', '磁力与下载']],
  [/^(explainthis|指令|prompt大全)/, ['AI 工具', '提示词']],
  [/^(dazi|askmany)/, ['AI 工具', '对话与模型']],
  [/^(cliproxy|proxypool|85la|free.?prox)/, ['网络', '免费节点']],
  [/^(aptoide|pdalife|apkpure|modyolo|rockmods|getmodsapk|verseapk|playsearch)/, ['安卓', 'APK 与应用']],
  [/^(douyin|creator\.douyin|抖音)/, ['社区论坛', '中文社区']],
  [/^(bing|cn\.bing)/, ['资源导航', '搜索引擎']],
  [/^(fiber\.google|speedtest|fast\.com)/, ['网络', '测速与查询']],
  [/^(savefrom|zh\.savefrom)/, ['影音媒体', '视频解析与下载']],
];

// 标题/URL 关键词兜底规则（域名规则未命中时用）
export const KEYWORD_RULES = [
  { re: /(^|[^a-z])(ai|gpt|llm|chatbot|大模型|claude|gemini|midjourney|绘画|stable.?diffusion)($|[^a-z])/i, cat: ['AI 工具', '其他'] },
  { re: /github|gitee|gitlab|源码|开源/, cat: ['开发', '代码托管'] },
  { re: /文档|docs|教程|tutorial|blog|博客|笔记/i, cat: ['开发', '博客与教程'] },
  { re: /api|中转|token|key/i, cat: ['AI 工具', 'API 与中转站'] },
  { re: /机场|节点|订阅|clash|vpn|翻墙|代理/i, cat: ['网络', '机场与节点'] },
  { re: /pdf|转换|convert|压缩|格式/i, cat: ['实用工具', '格式转换'] },
  { re: /翻译|translate/i, cat: ['实用工具', '翻译'] },
  { re: /邮箱|mail/i, cat: ['账号服务', '临时邮箱'] },
  { re: /支付|发卡|收款|卡密/i, cat: ['账号服务', '发卡与支付'] },
  { re: /网盘|pan\.|下载|download/i, cat: ['影音媒体', '网盘与传输'] },
  { re: /视频|video|电影|movie|剧|anime|动漫|音乐|music/i, cat: ['影音媒体', '影视与音乐'] },
  { re: /vps|云|server|主机|面板/i, cat: ['云与基建', '服务器与面板'] },
  { re: /社区|论坛|forum|bbs/i, cat: ['社区论坛', '综合'] },
];
