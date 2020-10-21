<template>
	<el-row class="home-container">

		<el-col :span="24" class="header">
			<el-col :span="10" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
				<span @click="$router.push('/main')" style="cursor: pointer;">
					<i class="el-icon-s-opportunity"></i>{{collapsed?'':sysName}}
				</span>
			</el-col>
			<el-col :span="10">
				<div class="tools" @click.prevent="collapse">
					<i :class="collapsed?'el-icon-tickets':'el-icon-notebook-2'"></i>
				</div>
			</el-col>
			<el-col :span="4" class="userinfo">
				<el-dropdown trigger="hover">
					<span class="el-dropdown-link userinfo-inner">
						<span class="icon"><i class="el-icon-user-solid"></i></span>
						<span class="username">{{sysUserName}}</span>
					</span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item @click.native="$router.push('/main')">我的主页</el-dropdown-item>
						<el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-col>
		</el-col>

		<el-col :span="24" class="main">

			<aside :class="collapsed?'menu-collapsed':'menu-expanded'">
				<!--导航菜单-未折叠状态-->
				<el-menu :default-active="$route.path" unique-opened router v-show="!collapsed">
					<template v-for="(item,index) in routes">
						<!-- 非单节点菜单 -->
						<el-submenu :index="index+''" :key="item.NavigationName" v-if="!item.leaf">
							<template slot="title"><i :class="item.Icon"></i>{{item.NavigationName}}</template>
							<el-menu-item v-for="child in routeChildren(item)" :index="child.Path" :key="child.Path">{{child.NavigationName}}</el-menu-item>
						</el-submenu>
						<!-- 单节点菜单 -->
						<el-menu-item v-if="item.leaf&&item.childs.length>0" :index="item.childs[0].Path" :key="item.NavigationName">
							<i :class="item.Icon"></i>{{item.childs[0].NavigationName}}
						</el-menu-item>
					</template>
				</el-menu>
				<!-- 导航菜单-折叠状态 -->
				<ul class="el-menu collapsed" v-show="collapsed" ref="menuCollapsed">
					<li v-for="(item,index) in routes" :key="item.NavigationName" class="el-submenu item">
						<!--非单节点菜单-->
						<div v-if="!item.leaf">
							<div class="el-submenu__title" style="padding-left: 18px;" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)"><i
								 :class="item.Icon"></i></div>
							<ul class="el-menu submenu" :class="'submenu-hook-'+index" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)">
								<li v-for="child in item.childs" :key="child.Path" class="el-menu-item" :class="$route.path===child.Path?'is-active':''"
								 @click="$router.push(child.Path)">{{child.NavigationName}}
								</li>
							</ul>
						</div>
						<!-- 单节点菜单 -->
						<div v-else>
					<li class="el-submenu">
						<div class="el-submenu__title el-menu-item" style="height: 56px;line-height: 56px;padding: 0 20px;" :class="$route.path===item.childs[0].Path?'is-active':''"
						 @click="$router.push(item.childs[0].Path)">
							<i :class="item.iconCls"></i>
						</div>
					</li>
					</div>
					</li>
				</ul>
			</aside>

			<section class="content-container">
				<div class="grid-content bg-purple-light">
					<el-col :span="24" class="breadcrumb-container">
						<strong class="title">{{$route.name}}</strong>
						<el-breadcrumb separator="/" class="breadcrumb-inner">
							<el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
								{{ item.name }}
							</el-breadcrumb-item>
						</el-breadcrumb>
					</el-col>
					<el-col :span="24" class="content-wrapper">
						<transition name="fade" mode="out-in">
							<router-view></router-view>
						</transition>
					</el-col>
				</div>
			</section>

		</el-col>

	</el-row>
</template>

<script>
	import {
		menuOfUser
	} from '@/api/api'
	export default {
		data() {
			return {
				sysName: 'Amz-Buy',
				collapsed: false,
				sysUserName: '',
				routes: []
			}
		},

		created() {
			this.getTreeData()
		},

		computed: {
			// 利用闭包实现计算属性传参。
			routeChildren: function(route) {
				return function(route) {
					return route.childs
				}
			}
		},

		methods: {
			// 根据登录人获取菜单目录树数据及权限path
			getTreeData() {
				let _this = this
				let userId = sessionStorage.getItem('userId')
				let params = {
					Id: userId
				}
				menuOfUser(params).then(res => {
					let data = res.topModels
					_this.routes = data

					//获取权限path存入session
					let pathArr = []
					for (const x in data) {
						let child = data[x].childs
						if (child.length > 0) {
							for (const y in child) {
								let path = child[y].Path
								if (path.length > 0) {
									pathArr.push(path)
								}
							}
						}
					}
					sessionStorage.setItem('pathArr', pathArr)

				}).catch((e) => {})
			},

			// 退出登录
			logout: function() {
				var _this = this
				this.$confirm('确认退出吗?', '提示', {
					type: 'warning'
				}).then(() => {
					sessionStorage.clear()
					_this.$router.push('/login')
				}).catch(() => {})
			},

			// 折叠导航栏
			collapse: function() {
				this.collapsed = !this.collapsed
			},
			showMenu(i, status) {
				this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-' + i)[0].style.display = status ? 'block' : 'none'
			}
		},

		mounted() {
			let userName = sessionStorage.getItem('userName')
			if (userName) {
				this.sysUserName = userName || ''
			}
		}

	}
</script>
