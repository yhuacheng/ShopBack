<template>
	<section>
		<div class="mb20">
			<el-button size="small" type="primary" @click="handleAdd">新增</el-button>
		</div>

		<!--列表-->
		<el-table border :data="tableData" @selection-change="selsChange" v-loading="listLoading" style="width: 100%" id="tableData"
		 ref='tableData'>
			<el-table-column type="index" label="#" align="center"></el-table-column>
			<el-table-column prop="Color" label="商品颜色" align="center"></el-table-column>
			<el-table-column prop="ProductImage" label="商品图" align="center">
				<template slot-scope="scope">
					<img style="width: 40px;height: 40px;margin-right: 2px;" v-for="item in scope.row.ProductImage" v-if="item" :src="item"
					 @click.stop="showImage(item)" />
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="100">
				<template v-slot="scope">
					<el-button size="small" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--编辑界面-->
		<el-dialog :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal" width="60%"
		 append-to-body>
			<el-form :model="editForm" label-width="100px" :rules="rules" ref="editForm">
				<el-form-item label="商品颜色" prop="color">
					<el-input v-model="editForm.color" style="width: 150px;"></el-input>
				</el-form-item>
				<el-form-item label="商品图片" prop="picture">
					<el-upload action="" list-type="picture-card" multiple :limit="6" :file-list="fileListAdd" :on-remove="handleAddRemove"
					 :on-change="handleAddChange" :auto-upload="false" accept="image/jpeg,image/png,image/gif,image/bmp" :class="{'hide':hideUploadAdd}"
					 :disabled="disUpload">
						<i class="el-icon-plus"></i>
						<div class="el-upload__tip warning" slot="tip">注意：最多上传6张图片，第1张为封面图，每张图片不能大于5M，建议上传 600*600 尺寸</div>
					</el-upload>
					<div v-if="doType=='edit'">
						<el-button type="danger" size="mini" @click='editImg'>重新编辑图片</el-button>
						<el-button type="warning" size="mini" @click='resetImg'>重置商品图片</el-button>
						<el-button type="success" size="mini" @click='uploadColorImg'>上传图片</el-button>
						<span class="danger">（图片编辑完毕后请点击“图片上传”按钮完成图片的修改）</span>
					</div>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeModal">取消</el-button>
				<el-button type="primary" v-if="doType==='add'" @click="addSubmit" :loading="btnLoading">提交</el-button>
				<el-button type="primary" v-if="doType==='edit'" @click="editSubmit" :loading="btnLoading">提交</el-button>
			</div>
		</el-dialog>

		<!-- 图片大图预览 -->
		<el-dialog title="图片预览" :visible.sync="ViewImageModal" width="60%" append-to-body>
			<div class="txt-c">
				<img :src='ViewImageUrl' />
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import {
		colorList,
		colorAdd,
		colorEdit,
		colorImg
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
				selsData: [],
				selectId: '',
				editForm: {
					color: '',
					imgUrl: ''
				},
				fileListAdd: [],
				hideUploadAdd: false,
				fileListData: [],
				disUpload: false,
				ViewImageModal: false,
				ViewImageUrl: '',
				rules: {
					color: {
						required: true,
						message: '请输入商品颜色',
						trigger: 'blur'
					}
				}
			}
		},
		props: ['productId'],
		created() {
			this.getData()
		},
		methods: {
			// 获取列表数据
			getData() {
				let _this = this
				_this.listLoading = true
				let params = {
					ProductManageId: _this.productId
				}
				colorList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.result
					_this.tableData.forEach((item, idx) => {
						item.ProductImage = item.Picture ? item.Picture.split(',') : []
					})
				}).catch((e) => {})
			},

			// 显示新增框
			handleAdd() {
				let _this = this
				_this.title = '新增颜色'
				_this.doType = 'add'
				_this.editModal = true
			},

			// 显示编辑框
			handleEdit(index, row) {
				let _this = this
				_this.title = '编辑颜色'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editModal = true
				_this.editForm.color = row.Color
				_this.editForm.imgUrl = row.Picture

				//图片转换为 url:'xxx' 格式才能回显
				let img = row.Picture
				if (img) {
					let imgArr = img.split(',')
					let formatImgArr = []
					for (let x in imgArr) {
						let obj = new Object()
						obj.url = imgArr[x]
						formatImgArr.push(obj)
					}
					_this.fileListAdd = formatImgArr //赋值给图片上传控件回显数据
					_this.fileListData = formatImgArr //记录获取到的原始数据
				}
				_this.disUpload = true //修改时默认先禁用图片上传功能
				_this.hideUploadAdd = true //隐藏图片上传控件
			},

			//关闭新增编辑弹窗
			closeModal() {
				let _this = this
				_this.editModal = false
				_this.btnLoading = false
				_this.$refs['editForm'].resetFields()
				_this.editForm = {
					color: '',
					imgUrl: ''
				}
				_this.fileListAdd = []
				_this.hideUploadAdd = false
				_this.fileListData = []
				_this.disUpload = false
			},

			//编辑页面打开图片编辑功能
			editImg() {
				let _this = this
				_this.disUpload = false
				_this.fileListAdd = []
				_this.hideUploadAdd = false
			},

			//编辑页面重置图片的回显
			resetImg() {
				let _this = this
				_this.disUpload = true
				_this.fileListAdd = _this.fileListData
				_this.hideUploadAdd = true
			},

			//新增提交
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true

						//创建formData 用formData形式传参
						let params = new FormData();
						params.append('ProductManageId', _this.productId)
						params.append('Color', _this.editForm.color)
						_this.fileListAdd.map(item => {
							params.append("image", item.raw);
						})

						colorAdd(params).then(res => {
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
							Id: [_this.selectId],
							datas: [{
								"ColorId": _this.selectId,
								"ColorPicture": _this.editForm.imgUrl,
								"Color": _this.editForm.color
							}]
						}
						colorEdit(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			//商品编辑图片上传提交
			uploadColorImg() {
				let _this = this
				let params = new FormData();
				params.append('ColorId', _this.selectId)
				params.append('ColorName', _this.editForm.color)
				_this.fileListAdd.map(item => {
					params.append("image", item.raw);
				})
				colorImg(params).then(res => {
					_this.editForm.imgUrl = res.data
				})
			},

			// 商品图片上传
			handleAddChange(file, fileList) {
				const isLt5M = file.size / 1024 / 1024 < 5;
				if (!isLt5M) {
					this.$message.error('图片不能大于5M');
					fileList.splice(-1, 1);
				} else {
					this.fileListAdd = fileList;
				}
				// 上传文件>=限制个数时隐藏上传组件
				if (fileList.length >= 6) {
					this.hideUploadAdd = true;
				}
			},
			// 移除文件
			handleAddRemove(file, fileList) {
				this.fileListAdd = fileList
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
