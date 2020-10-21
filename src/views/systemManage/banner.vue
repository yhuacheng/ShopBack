<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item label="国家" prop="country">
					<el-select v-model="searchForm.country" placeholder="请选择国家" size="small">
						<el-option value="0" label="全部国家"></el-option>
						<el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName" :value="item.Id"></el-option>
					</el-select>
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
			<el-table-column prop="Image" label="轮播图" align="center">
				<template slot-scope="scope">
					<img style="width: 120px;height: 40px;" v-if="scope.row.Image" :src="scope.row.Image" @click.stop="showImage(scope.row.Image)" />
				</template>
			</el-table-column>
			<el-table-column prop="CountryName" label="国家" align="center"></el-table-column>
			<el-table-column prop="Link" label="链接" align="center"></el-table-column>
			<el-table-column prop="State" label="状态" align="center">
				<template v-slot="scope">
					<span class="success" v-if="scope.row.State=='1'">正常</span>
					<span class="danger" v-if="scope.row.State=='0'">禁用</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="100">
				<template v-slot="scope">
					<el-button size="small" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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
			<el-form :model="editForm" label-width="60px" :rules="rules" ref="editForm">
				<el-form-item label='轮播图' prop='image' class="banner">
					<el-upload action=" " list-type="picture-card" multiple :limit="1" :file-list="fileListAdd" :on-remove="handleAddRemove"
					 :on-change="handleAddChange" :auto-upload="false" accept="image/jpeg,image/png,image/gif,image/bmp" :class="{'hide':hideUploadAdd}">
						<i class="el-icon-plus"></i>
						<div class="el-upload__tip warning" slot="tip">注意：图片不能大于5M，建议上传 1440*360 尺寸</div>
					</el-upload>
				</el-form-item>
				<el-form-item label="国家" prop="country">
					<el-select v-model="editForm.country" placeholder="请选择国家" class="w100">
						<el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName" :value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="链接" prop="url">
					<el-input v-model="editForm.url"></el-input>
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
		bannerList,
		bannerAdd,
		bannerEdit,
		countryList
	} from '@/api/api'

	export default {
		name: 'banner',
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
				tableData: [],
				countryData: [],
				selsData: [],
				selectId: '',
				searchForm: {
					country: '0'
				},
				editForm: {
					country: '',
					url: '',
					state: 1
				},
				fileListAdd: [],
				hideUploadAdd: false,
				ViewImageModal: false,
				ViewImageUrl: '',
				rules: {
					country: {
						required: true,
						message: '请选择国家',
						trigger: 'blur'
					}
				}
			}
		},
		created() {
			this.getData()
			this.getCountryData()
		},
		methods: {
			// 获取列表数据
			getData() {
				let _this = this
				_this.listLoading = true
				let params = {
					Name: _this.searchForm.country,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}
				bannerList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.Entity
					_this.total = Number(res.TotalCount)
				}).catch((e) => {})
			},

			// 获取国家数据
			getCountryData() {
				let _this = this
				let params = {
					Name: '',
					pageIndex: 1,
					pageSize: 100000000
				}
				countryList(params).then(res => {
					_this.countryData = res.Entity
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
						country: '0'
					},
					_this.getData()
			},

			// 显示新增框
			handleAdd() {
				let _this = this
				_this.title = '新增轮播图'
				_this.doType = 'add'
				_this.editModal = true
			},

			// 显示编辑框
			handleEdit(index, row) {
				let _this = this
				_this.title = '编辑轮播图'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editModal = true
				_this.editForm.country = Number(row.CountryId)
				_this.editForm.url = row.Link
				_this.editForm.state = Number(row.State)

				//图片转换为 url:'xxx' 格式才能回显
				if (row.Image) {
					let formatImgArr = []
					let obj = new Object()
					obj.url = row.Image
					formatImgArr.push(obj)
					_this.fileListAdd = formatImgArr //赋值给图片上传控件回显数据
					_this.hideUploadAdd = true
				} else {
					_this.fileListAdd = []
					_this.hideUploadAdd = true
				}
			},

			//关闭新增编辑弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.btnLoading = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					country: '',
					url: '',
					state: 1
				}
				_this.fileListAdd = []
				_this.hideUploadAdd = false
			},

			//新增提交
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true

						//创建formData 用formData形式传参
						let params = new FormData();
						params.append('CountryId', _this.editForm.country)
						params.append('Link', _this.editForm.url)
						_this.fileListAdd.map(item => {
							params.append("image", item.raw);
						})

						bannerAdd(params).then(res => {
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

						//创建formData 用formData形式传参
						let params = new FormData();
						params.append('Id', _this.selectId)
						params.append('CountryId', _this.editForm.country)
						params.append('Link', _this.editForm.url)
						params.append('State', _this.editForm.state)
						_this.fileListAdd.map(item => {
							params.append("image", item.raw);
						})

						bannerEdit(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			// 轮播图片上传
			handleAddChange(file, fileList) {
				const isLt5M = file.size / 1024 / 1024 < 5;
				if (!isLt5M) {
					this.$message.error('图片不能大于5M');
					fileList.splice(-1, 1);
				} else {
					this.fileListAdd = fileList;
				}
				// 上传文件>=限制个数时隐藏上传组件
				if (fileList.length >= 1) {
					this.hideUploadAdd = true;
				}
			},
			// 移除文件
			handleAddRemove(file, fileList) {
				this.hideUploadAdd = false;
			},

			//查看大图
			showImage(url) {
				let _this = this
				_this.ViewImageModal = true
				_this.ViewImageUrl = url
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

<style>
	.banner .el-upload-list--picture-card .el-upload-list__item,
	.banner .el-upload--picture-card {
		width: 100% !important;
	}
</style>
