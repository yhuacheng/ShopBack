<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item label="搜索">
					<el-input size="small" v-model="searchForm.name" placeholder="请输入买家编号 / 买家名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button size="small" @click="searchData">查询</el-button>
					<el-button size="small" @click="resetSearch">重置</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table border :data="tableData" @selection-change="selsChange" v-loading="listLoading" style="width: 100%" id="tableData"
		 ref='tableData'>
			<el-table-column type="index" label="#" align="center"></el-table-column>
			<el-table-column prop="Id" label="买家编号" align="center"></el-table-column>
			<el-table-column prop="Name" label="姓名" align="center">
				<template slot-scope="scope">
					<span>{{scope.row.LastName}} · {{scope.row.FirstName}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="Email" label="邮箱" align="center"></el-table-column>
			<el-table-column prop="BuyerGrade" label="等级" align="center"></el-table-column>
			<el-table-column prop="BuyerScore" label="积分" align="center"></el-table-column>
			<el-table-column prop="PaypalAccount" label="PP账号" align="center"></el-table-column>
			<el-table-column prop="ProfileUrl" label="亚马逊个人介绍" align="center"></el-table-column>
			<el-table-column prop="ProfileImage" label="亚马逊介绍截图" align="center">
				<template slot-scope="scope">
					<img style="width: 60px;height: 40px;" v-if="scope.row.ProfileImage" :src="$IMGURL+scope.row.ProfileImage"
					 @click.stop="showImage($IMGURL+scope.row.ProfileImage)" />
				</template>
			</el-table-column>
			<el-table-column prop="RegistrationTime" label="注册时间" align="center"></el-table-column>
			<el-table-column prop="Enable" label="状态" align="center">
				<template v-slot="scope">
					<span class="success" v-if="scope.row.State===1">正常</span>
					<span class="danger" v-if="scope.row.State===-1">禁用</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="380">
				<template v-slot="scope">
					<el-button v-if="scope.row.State===-1" size="small" type="success" @click="handleEdit(scope.$index, scope.row,1)">启用</el-button>
					<el-button v-if="scope.row.State===1" size="small" type="danger" @click="handleEdit(scope.$index, scope.row,-1)">禁用</el-button>
					<el-button size="small" type="warning" @click="handleEdit(scope.$index, scope.row,2)">调级</el-button>
					<el-button size="small" type="primary" @click="handleEdit(scope.$index, scope.row,3)">充积分</el-button>
					<el-button size="small" type="warning" @click="handleEdit(scope.$index, scope.row,4)">扣积分</el-button>
					<el-button size="small" type="danger" @click="handleEdit(scope.$index, scope.row,5)">改密</el-button>
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

		<!--调整等级界面-->
		<el-dialog :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal" width="30%">
			<el-form :model="editForm" ref="editForm">
				<el-form-item prop="level" style="text-align: center;">
					<el-radio-group v-model="editForm.level">
						<el-radio v-for="item in levelData" :label="item" border size="mini" style="margin-right: 10px;"></el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeModal">取消</el-button>
				<el-button type="primary" @click="editLevel" :loading="btnLoading">提交</el-button>
			</div>
		</el-dialog>

		<!-- 图片大图预览 -->
		<el-dialog title="图片预览" :visible.sync="ViewImageModal" width="60%">
			<div class="txt-c">
				<img :src='ViewImageUrl' />
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import {
		buyerList,
		buyerEdit
	} from '@/api/api'

	export default {
		name: 'buyer',
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
				levelData: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
				tableData: [],
				selsData: [],
				selectId: '',
				buyerName: '',
				searchForm: {
					name: ''
				},
				editForm: {
					level: ''
				},
				ViewImageModal: false,
				ViewImageUrl: '',
			}
		},
		created() {
			this.getData()
		},
		methods: {
			// 获取列表数据
			getData() {
				let _this = this
				_this.listLoading = true
				let params = {
					keyWord: _this.searchForm.name,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}
				buyerList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.result.Entity
					_this.total = Number(res.result.total)
				}).catch((e) => {})
			},

			// 买家信息修改（启用1 禁用1 调级2 充积分3 扣积分4 改密5）
			handleEdit(index, row, val) {
				let _this = this
				_this.selectId = row.Id
				_this.buyerName = row.LastName
				if (val == 1 || val == -1) {
					_this.handleState(val)
				}
				if (val == 2) {
					_this.title = '调整【' + row.LastName + '】等级'
					_this.editModal = true
					_this.editForm.level = row.BuyerGrade
				}
				if (val == 3 || val == 4) {
					_this.handleMod(val)
				}
				if (val == 5) {
					_this.handlePswd()
				}
			},

			//用户启用禁用
			handleState(val) {
				let _this = this
				let txt = ''
				if (val == 1) {
					txt = '启用'
				}
				if (val == -1) {
					txt = '禁用'
				}
				_this.$confirm('确认 ' + txt + '【' + _this.buyerName + '】吗？', '信息提示', {
					type: 'warning'
				}).then(() => {
					let params = {
						Type: 1,
						Id: _this.selectId,
						KeyWord: val
					}
					buyerEdit(params).then((res) => {
						_this.getData()
					})
				}).catch(() => {})
			},

			//调整等级提交
			editLevel() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							Type: 2,
							Id: _this.selectId,
							KeyWord: _this.editForm.level,
						}
						buyerEdit(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			//关闭调整等级弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.btnLoading = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					level: ''
				}
			},

			//充扣积分弹窗
			handleMod(val) {
				let _this = this
				let txt = ''
				if (val == 3) {
					txt = '充值'
				}
				if (val == 4) {
					txt = '扣除'
				}
				_this.$prompt('请输入' + '【' + _this.buyerName + '】' + txt + '积分', '信息提示 ', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputPattern: /^[0-9]\d*$/,
					inputErrorMessage: '积分格式不正确，应为整数'
				}).then(({
					value
				}) => {
					_this.handModDo(val, value)
				}).catch(() => {})
			},

			//积分充扣
			handModDo(val, value) {
				let _this = this
				let params = {
					Type: val,
					Id: _this.selectId,
					KeyWord: value
				}
				buyerEdit(params).then(res => {
					_this.getData()
				}).catch((e) => {})
			},

			//修改密码
			handlePswd() {
				let _this = this
				_this.$prompt('请输入' + '【' + _this.buyerName + '】新密码', '信息提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputPattern: /\S/,
					inputErrorMessage: '密码不能为空'
				}).then(({
					value
				}) => {
					let params = {
						Type: 5,
						Id: _this.selectId,
						KeyWord: value
					}
					buyerEdit(params).then(res => {
						_this.getData()
					}).catch((e) => {})
				}).catch(() => {})
			},

			//查看大图
			showImage(url) {
				let _this = this
				_this.ViewImageModal = true
				_this.ViewImageUrl = url
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
