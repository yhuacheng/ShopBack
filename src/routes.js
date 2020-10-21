import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
	return originalPush.call(this, location).catch(err => err)
}

export default new Router({
	// mode: 'history',
	routes: [{
			path: '/login',
			component: () => import('./views/Login.vue'),
			name: '',
			hidden: true
		},
		{
			path: '/404',
			component: () => import('./views/404.vue'),
			name: '',
			hidden: true
		},
		{
			path: '/',
			component: () => import('./views/Home.vue'),
			name: '首页面板',
			hidden: true,
			children: [{
				path: '/main',
				component: () => import('./views/Main.vue'),
				name: '我的主页',
				hidden: true,
			}]
		},
		{
			path: '/',
			component: () => import('./views/Home.vue'),
			name: '商品管理',
			children: [{
				path: '/product',
				component: () => import('./views/productManage/product.vue'),
				name: '商品列表'
			}]
		},
		{
			path: '/',
			component: () => import('./views/Home.vue'),
			name: '订单管理',
			children: [{
				path: '/order',
				component: () => import('./views/orderManage/order.vue'),
				name: '订单列表'
			}]
		},
		{
			path: '/',
			component: () => import('./views/Home.vue'),
			name: '买家管理',
			children: [{
				path: '/buyer',
				component: () => import('./views/buyerManage/buyer.vue'),
				name: '买家列表'
			}]
		},
		{
			path: '/',
			component: () => import('./views/Home.vue'),
			name: '系统设置',
			children: [{
					path: '/user',
					component: () => import('./views/systemManage/user.vue'),
					name: '用户管理'
				},
				{
					path: '/role',
					component: () => import('./views/systemManage/role.vue'),
					name: '角色管理'
				},
				{
					path: '/country',
					component: () => import('./views/systemManage/country.vue'),
					name: '国家管理'
				},
				{
					path: '/type',
					component: () => import('./views/systemManage/type.vue'),
					name: '商品类别'
				},
				{
					path: '/banner',
					component: () => import('./views/systemManage/banner.vue'),
					name: '轮播管理'
				},
				{
					path: '/contact',
					component: () => import('./views/systemManage/contact.vue'),
					name: '联系方式'
				},
				{
					path: '/notice',
					component: () => import('./views/systemManage/notice.vue'),
					name: '系统公告'
				}
			]
		},
		{
			path: '*',
			hidden: true,
			redirect: {
				path: '/404'
			}
		}
	]
})
