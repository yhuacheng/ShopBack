<template>
	<div class="longin-box">
		<el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-container">
			<h3 class="title">Amz-Buy 后台管理</h3>
			<el-form-item prop="account">
				<el-input type="text" v-model="loginForm.account" auto-complete="off" prefix-icon="el-icon-user" placeholder="账号"></el-input>
			</el-form-item>
			<el-form-item prop="password">
				<el-input type="password" v-model="loginForm.password" auto-complete="off" prefix-icon="el-icon-lock" placeholder="密码"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button class="login-btn" type="primary" @click="loginIn" :loading="btnLoading">登录</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
	import {
		login
	} from '@/api/api'
	export default {
		name: 'Login',
		data() {
			return {
				btnLoading: false,
				loginForm: {
					account: '',
					password: ''
				},
				rules: {
					account: [{
						required: true,
						message: '请输入账号',
						trigger: 'blur'
					}],
					password: [{
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					}]
				}
			}
		},
		created() {
			//回车键登录
			let _this = this
			document.onkeydown = function(e) {
				var key = window.event.keyCode
				if (key === 13) {
					_this.loginIn()
				}
			}
		},
		beforeDestroy() {
			//离开页面销毁回车键事件
			document.onkeydown = function(e) {
				var key = window.event.keyCode
				if (key === 13) {}
			}
		},
		methods: {
			// 登录
			loginIn() {
				let _this = this
				_this.$refs.loginForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							LoginName: _this.loginForm.account,
							PassWord: _this.loginForm.password
						}
						login(params).then(res => {
							let user = res.Data
							sessionStorage.setItem('userId', user.Id)
							sessionStorage.setItem('userName', user.Name)
							_this.btnLoading = false
							this.$router.push('/main')
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			}
		}
	}
</script>
