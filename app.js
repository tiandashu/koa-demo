const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const views = require('koa-views');
const session = require('koa-session');
const koajwt = require('koa-jwt');
const jwt = require('jsonwebtoken');

const { resolve } = require('path');
const app = new Koa();
const router = new Router();

// 配置session
app.keys = ['some secret hurr'];
const CONFIG = {
  key: 'koa:sess', //cookie key (default is koa:sess)
  maxAge: 100000, // cookie 的过期时间 maxAge in ms (default is 1 days)
  overwrite: true, //是否可以 overwrite (默认 default true)
  httpOnly: true, //cookie 是否只有服务器端可以访问 httpOnly or not (default true)
  signed: true, //签名默认 true
  rolling: false, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）
  renew: false, //(boolean) renew session when session is nearly expired,
};
app.use(session(CONFIG, app));

// 配置jwt
const secret = 'jwt demo';
app.use(function (ctx, next) {
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = 'Protected resource, use Authorization header to get access\n';
    } else {
      throw err;
    }
  });
});
app.use(
  koajwt({ secret: secret }).unless({
    // 不需要验证jwt的地址
    path: [/^\/public^|\/login/],
  })
);

// 中间件
app.use(async (ctx, next) => {
  ctx.body = 'hello';
  await next();
});

// 静态服务
app.use(static('./static'));

// 渲染服务
app.use(
  views(resolve(__dirname, './views'), {
    extension: 'pug',
  })
);

// 接口
router.get('/login', async (ctx, next) => {

  // 设置session 给前端
  ctx.session.session_name = "session_name_张三"

  // 设置cookie 给前端
  // koa 中的cookie不能出现中文
  ctx.cookies.set('cookie_name', 'cookie_name');

  // 生成jwt 给前端
  let jwt_token = {
    name: 'jwt_name_王五'
  }
  const token = jwt.sign(jwt_token, secret, {expiresIn: '1h'})
 
  ctx.body = {
    token: token,
    message: '获取token成功',
    code: 1,
  };
});

router.get('/user', async (ctx, next) => {
  let session_name = ctx.session.session_name
  // 默认取authorization
  let jwt_name = ctx.header.authorization
  let cookie_name = ctx.cookies.get('cookie_name')
  ctx.body = {
    session: session_name,
    jwt: jwt_name,
    cookie: cookie_name
  };
});

router.get('/render', async (ctx, next) => {
  let { kw } = ctx.query;
  ctx.state = {
    session: JSON.stringify(ctx.session),
    title: 'app',
  };
  await ctx.render('index', {
    text: 'hello pug render',
    kw,
    list: [
      {
        name: 111,
      },
      {
        name: 222,
      },
      {
        name: 333,
      },
    ],
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.log('node serve start at: http://localhost:3000');
});
