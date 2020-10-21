<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item label="角色名">
					<el-input size="small" v-model="searchForm.name" placeholder="请输入角色名"></el-input>
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
			<el-table-column prop="RoleName" label="角色名" align="center"></el-table-column>
			<el-table-column prop="Remarks" label="备注" align="center"></el-table-column>
			<el-table-column label="操作" align="center" width="200">
				<template v-slot="scope">
					<el-button size="small" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button size="small" type="warning" @click="handleBind(scope.$index, scope.row)">分配权限</el-button>
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
				<el-form-item label="角色名" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input type="textarea" v-model="editForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeModal">取消</el-button>
				<el-button type="primary" v-if="doType==='add'" @click="addSubmit" :loading="btnLoading">提交</el-button>
				<el-button type="primary" v-if="doType==='edit'" @click="editSubmit" :loading="btnLoading">提交</el-button>
			</div>
		</el-dialog>

		<!-- 角色绑定菜单 -->
		<el-drawer :title="title" :visible.sync="drawer" :before-close="closeDrawer" width="30%" custom-class='drawer-Box'>
			<div class="drawer-content">
				<el-tree :data="treeData" ref="tree" show-checkbox node-key="Id" :default-expand-all="true" :props="defaultProps"></el-tree>
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
		roleList,
		roleAdd,
		roleEdit,
		menuList,
		roleBindMenu,
		roleCheckedMenu
	} from '@/api/api'

	export default {
		name: 'role',
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
				searchForm: {
					name: ''
				},
				editForm: {
					name: '',
					remark: ''
				},
				treeData: [],
				defaultProps: {
					children: 'childs',
					label: 'NavigationName'
				},
				rules: {
					name: [{
						required: true,
						message: '请输入角色名',
						trigger: 'blur'
					}]
				}
			}
		},
		created() {
			this.getData()
			this.getTreeData()
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
				roleList(params).then(res => {
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
				_this.title = '新增角色'
				_this.doType = 'add'
				_this.editModal = true
			},

			// 显示编辑框
			handleEdit(index, row) {
				let _this = this
				_this.title = '编辑角色'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editModal = true
				_this.editForm.name = row.RoleName
				_this.editForm.remark = row.Remarks
			},

			//新增提交
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							RoleName: _this.editForm.name,
							Remarks: _this.editForm.remark,
						}
						roleAdd(params).then(res => {
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
							RoleName: _this.editForm.name,
							Remarks: _this.editForm.remark,
						}
						roleEdit(params).then(res => {
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
					remark: '',
				}
			},

			// 获取菜单目录树数据
			getTreeData() {
				let _this = this
				let params = {}
				menuList(params).then(res => {
					_this.treeData = res.topModels
				}).catch((e) => {})
			},

			//回显角色已勾选菜单
			getCheckedMenu() {
				let _this = this
				let params = {
					RoleId: _this.selectId
				}
				roleCheckedMenu(params).then(res => {
					setTimeout(function() {
						res.list.forEach(value => {
							_this.$refs.tree.setChecked(value, true, false)
						})
					}, 200)
					_this.drawer = true //获取到数据后再打开弹窗，避免请求缓慢时未回显数据
				}).catch((e) => {})
			},

			// 打开菜单目录树
			handleBind(index, row) {
				let _this = this
				_this.selectId = row.Id
				_this.title = '为角色【' + row.RoleName + '】分配权限'
				_this.getCheckedMenu()
			},

			// 绑定菜单提交
			bindSubmit() {
				let _this = this

				let checkedKeys = _this.$refs.tree.getCheckedKeys() //选中
				let hafCheckedKeys = _this.$refs.tree.getHalfCheckedKeys() //半选
				let selectedTreeId = checkedKeys.concat(hafCheckedKeys) //组合全选与半选

				let params = {
					Id: _this.selectId,
					NavigationBarId: selectedTreeId
				}
				roleBindMenu(params).then(res => {
					_this.closeDrawer()
					_this.getData()
				}).catch((e) => {})
			},

			//关闭角色绑定菜单
			closeDrawer() {
				let _this = this
				_this.drawer = false
				_this.$refs.tree.setCheckedKeys([]);
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
