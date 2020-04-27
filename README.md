### koa2模板
```
npm install koa-generator -g

koa2 demo

cd demo

npm i

npm run dev
```

### koa2以及常用中间件
- koa
```
# koa
npm i koa -S

# app.js
const Koa = require('koa')
const app = new Koa()

app.use(async (ctx, next)=>{
    ctx.body = 'hello'
}

app.listen(3000, (err) => {
    console.log('serve start at: http:/localhost:3000')
})
```

- koa-router
```
# koa 路由模块
npm i koa-router -S

# app.js
const Router = require('koa-router')
const router = new Router()

router.get('/get', async (ctx, next) => {
    // 获取get参数
    // let query = ctx.request.query
    ctx.body = 'hello get'
})

router.post('/post', async (ctx, next) => {
    ctx.body = 'hello post'
})

app.use(router.routes())
app.use(router.allowedMethods())
```

- koa-views
```
# koa 渲染服务
npm install koa-views pug -S

# app.js
const views = require('koa-views')
const { resolve } = require('path')

app.use(views(resove(__dirname, './views'), {
  extension: 'pug'
}));

# 使用了koa-router 和 pug模板
router.get('/render', async (ctx, next) => {
  let { kw } = ctx.query
  ctx.state = {
    // session: this.session,
    title: 'app'
  };
  await ctx.render('index',{
    text: 'hello pug render',
    kw,
    list: [
      {
        name: 111
      },
      {
        name: 222
      },
      {
        name: 333
      }
    ]
  })
})

# views/index.pug
html
  head
    title #{title}
  body
    h1 #{text}

    if kw
      p kw is #{kw}
    else
      p no kw

    ul
      each val in list
        li #{val.name}
```
- koa-static
```
# 静态服务
npm i koa-static

# app.js
const static = require('koa-static')

# 可以直接访问static文件夹下的资源
app.use(static('./static'))
```

- koa-bodyparser
```
# 解析post参数
npm i koa-bodyparser -S

# app.js
const bodyparser = require('koa-bodyparser')

app.use(bodyParser())

router.post('/doAdd',async (ctx) =>{
    // 获取表单数据
    // let data = await common.getPostData(ctx)
    // console.log(data)
    
    // 获取post参数
    console.log(ctx.request.body)

})

# 不用koa-bodyparser，原生接受post参数
exports.getPostData = function (ctx) {
     return new Promise((resolve, reject) => {
         try {
             let str = ''
             ctx.req.on('data', (chunk) => {
                 str += chunk
             })
             ctx.req.on('end', (chunk) => {
                 resolve(str)
             })
         }catch(err){
             reject(err)
         }
    })

}
```

- koa2-cors
```
# 允许跨域
npm install --save koa2-cors

# app.js
const cors = require('koa2-cors')
app.use(cors())
```

- koa-jwt
```
# 配置jwt
npm i jsonwebtoken
npm i koa-jwt

# app.js
const koajwt = require('koa-jwt');
const jwt = require('jsonwebtoken');

const secret = 'jwt demo';

app.use(function (ctx, next) {
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = '没有权限';
    } else {
      throw err;
    }
  });
});

# 自动验证请求头中的 authorization
app.use(
  koajwt({ secret: secret }).unless({
    // 不需要验证jwt的地址
    path: [/^\/public^|\/login/],
  })
);


# /login 接口
// 生成jwt 给前端
let jwt_token = {
    name: 'jwt_name_王五'
}
const token = jwt.sign(jwt_token, secret, {expiresIn: '1h'})
ctx.body = token

# 接口中获取jwt
let jwt_name = ctx.header.authorization
```

- 设置cookie
```
ctx.cookies.get(name)
ctx.cookies.set(name, value, [options])

# options
- maxAge 一个数字表示从 Date.now() 得到的毫秒数
- expires cookie 过期的 Date
- path cookie 路径, 默认是'/' domain cookie 域名
- secure 安全 cookie 默认 false，设置成 true 表示
只有 https 可以访问
- httpOnly 是否只是服务器可访问 cookie, 默认是 true
- overwrite 一个布尔值，表示是否覆盖以前设置的同名
的 cookie (默认是 false). 如果是 true, 在同
一个请求中设置相同名称的所有 Cookie（不
管路径或域）是否在设置此 Cookie 时从
Set-Cookie 标头中过滤掉。

# koa 中的cookie无法直接设置中文

# 中文转base64保存cookie
new Buffer('hello, world!').toString('base64')
# base64转中文获取cookie
new Buffer('aGVsbG8sIHdvcmxkIQ==', 'base64').toString()
```

- koa-session
```
# 服务端session
npm i koa-session -S

# app.js
const session = require('koa-session');

app.keys = ['some secret hurr']
const CONFIG = {
  key: 'koa:sess', //cookie key (default is koa:sess)
  maxAge: 1, // cookie 的过期时间 maxAge in ms (default is 1 days)
  overwrite: true, //是否可以 overwrite (默认 default true)
  httpOnly: true, //cookie 是否只有服务器端可以访问 httpOnly or not (default true)
  signed: true, //签名默认 true
  rolling: false, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）
  renew: false, //(boolean) renew session when session is nearly expired,
}
app.use(session(CONFIG, app))

# 设置session
ctx.session.username = "张三"

# 获取session
let username = ctx.session.username
```