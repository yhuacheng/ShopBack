<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item label="姓名">
					<el-input size="small" v-model="searchForm.name" placeholder="请输入姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button size="small" @click="searchData">查询</el-button>
					<el-button size="small" @click="resetSearch">重置</el-button>
					<el-button size="small" type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table border :data="tableData" @selection-change="selsChange" v-loading="listLoading" style="width: 100%" id="tableData"
		 ref='tableData'>
			<el-table-column type="index" label="#" align="center"></el-table-column>
			<el-table-column prop="Name" label="姓名" align="center"></el-table-column>
			<el-table-column prop="LoginName" label="账号" align="center"></el-table-column>
			<el-table-column prop="Phone" label="手机" align="center"></el-table-column>
			<el-table-column prop="RoleName" label="角色" align="center"></el-table-column>
			<el-table-column prop="State" label="状态" align="center">
				<template v-slot="scope">
					<span class="success" v-if="scope.row.State===1">正常</span>
					<span class="danger" v-if="scope.row.State===0">禁用</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="250">
				<template v-slot="scope">
					<el-button size="small" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button size="small" type="danger" @click="handleEditPswd(scope.$index, scope.row)">改密</el-button>
					<el-button size="small" type="warning" @click="handleBind(scope.$index, scope.row)">绑定角色</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
			 :current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="10" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal" width="30%">
			<el-form :model="editForm" label-width="80px" :rules="rules" ref="editForm">
				<el-form-item label="姓名" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="账号" prop="account">
					<el-input :disabled="doType==='edit'" v-model="editForm.account"></el-input>
				</el-form-item>
				<el-form-item v-if="doType==='add'" label="密码" prop="password">
					<el-input v-model="editForm.password"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="phone">
					<el-input v-model="editForm.phone"></el-input>
				</el-form-item>
				<el-form-item v-if="doType==='edit'" label="状态" prop="state">
					<el-radio-group v-model="editForm.state">
						<el-radio :label="1">正常</el-radio>
						<el-radio :label="0">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeModal">取消</el-button>
				<el-button type="primary" v-if="doType==='add'" @click="addSubmit" :loading="btnLoading">提交</el-button>
				<el-button type="primary" v-if="doType==='edit'" @click="editSubmit" :loading="btnLoading">提交</el-button>
			</div>
		</el-dialog>

		<!-- 用户绑定角色 -->
		<el-drawer :title="title" :visible.sync="drawer" :before-close="closeDrawer" custom-class='drawer-Box'>
			<div class="drawer-content">
				<el-checkbox-group v-model="role">
					<el-checkbox style="display:block;padding: 15px" v-for="item in roleData" :label="item.Id" :key="item.Id">{{item.RoleName}}</el-checkbox>
				</el-checkbox-group>
				<div class="drawer-footer">
					<el-button @click="closeDrawer">取 消</el-button>
					<el-button type="primary" @click="bindSubmit" :loading="btnLoading">提交</el-button>
				</div>
			</div>
		</el-drawer>
	</section>
</template>

<script>
	import {
		userList,
		userAdd,
		userEdit,
		userEditPassword,
		roleList,
		userBindRole,
		userCheckedRole
	} from '@/api/api'

	export default {
		name: 'user',
		data() {
			return {
				title: '',
				pageIndex: 1,
				pageSize: 10,
				total: 0,
				doType: '',
				editModal: false,
				listLoading: false,
				btnLoading: false,
				drawer: false,
				tableData: [],
				selsData: [],
				selectId: '',
				roleData: [],
				role: [],
				searchForm: {
					name: ''
				},
				editForm: {
					name: '',
					account: '',
					password: '',
					phone: '',
					state: ''
				},
				rules: {
					name: [{
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					}],
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
			this.getData()
			this.getRoleData()
		},
		methods: {
			// 获取列表数据
			getData() {
				let _this = this
				_this.listLoading = true
				let params = {
					Name: _this.searchForm.name,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}
				userList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.Entity
					_this.total = Number(res.TotalCount)
				}).catch((e) => {})
			},

			//查询
			searchData() {
				let _this = this
				_this.pageIndex = 1
				_this.getData()
			},

			//重置
			resetSearch() {
				let _this = this
				_this.pageIndex = 1
				_this.searchForm = {
						name: ''
					},
					_this.getData()
			},

			// 显示新增框
			handleAdd() {
				let _this = this
				_this.title = '新增用户'
				_this.doType = 'add'
				_this.editModal = true
			},

			// 显示编辑框
			handleEdit(index, row) {
				let _this = this
				_this.title = '编辑用户'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editModal = true
				_this.editForm.name = row.Name
				_this.editForm.account = row.LoginName
				_this.editForm.phone = row.Phone
				_this.editForm.state = row.State
			},

			//新增提交
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							Name: _this.editForm.name,
							LoginName: _this.editForm.account,
							Password: _this.editForm.password,
							Phone: _this.editForm.phone
						}
						userAdd(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			//编辑提交
			editSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							Id: _this.selectId,
							Name: _this.editForm.name,
							Phone: _this.editForm.phone,
							State: _this.editForm.state
						}
						userEdit(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			//关闭新增编辑弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.btnLoading = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					name: '',
					account: '',
					password: '',
					phone: '',
					state: ''
				}
			},

			//修改密码弹窗
			handleEditPswd(index, row, val) {
				let _this = this
				_this.selectId = row.Id
				_this.$prompt('请输入新密码', '信息提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputPattern: /\S/,
					inputErrorMessage: '密码不能为空'
				}).then(({
					value
				}) => {
					_this.editPassword(value)
				}).catch(() => {})
			},

			//修改密码
			editPassword(value) {
				let _this = this
				let params = {
					Id: _this.selectId,
					NewPassword: value,
					ConfirmPassword: value
				}
				userEditPassword(params).then(res => {
					_this.closeModal()
					_this.getData()
				}).catch((e) => {})
			},

			// 获取角色数据
			getRoleData() {
				let _this = this
				let params = {
					Name: '',
					pageIndex: 1,
					pageSize: 100000000
				}
				roleList(params).then(res => {
					_this.roleData = res.Entity
				}).catch((e) => {})
			},

			//获取用户已勾选角色
			getCheckedRole() {
				let _this = this
				let params = {
					Id: _this.selectId
				}
				userCheckedRole(params).then(res => {
					_this.role = res.list
					_this.drawer = true //获取到数据后再打开弹窗，避免请求缓慢时未回显数据
				}).catch((e) => {})
			},

			// 打开角色界面
			handleBind(index, row) {
				let _this = this
				_this.selectId = row.Id
				_this.title = '为用户【' + row.Name + '】绑定角色'
				_this.getCheckedRole()
			},

			// 绑定角色提交
			bindSubmit() {
				let _this = this
				let params = {
					Id: _this.selectId,
					RoolId: _this.role
				}
				userBindRole(params).then(res => {
					_this.closeDrawer()
					_this.getData()
				}).catch((e) => {})
			},

			//关闭用户绑定角色
			closeDrawer() {
				let _this = this
				_this.drawer = false
				_this.role = []
			},

			//选中数据
			selsChange(selsData) {
				this.selsData = selsData
			},

			//翻页
			handleSizeChange(val) {
				let _this = this
				_this.pageSize = val
				_this.getData()
			},
			//跳转
			handleCurrentChange(val) {
				let _this = this
				_this.pageIndex = val
				_this.getData()
			}

		}
	}
</script>
