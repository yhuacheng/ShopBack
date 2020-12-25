<template>
	<section>
		<div class="mb20">
			<el-button size="small" type="primary" @click="handleAdd">新增</el-button>
		</div>

		<!--列表-->
		<el-table border :data="tableData" @selection-change="selsChange" v-loading="listLoading" style="width: 100%" id="tableData"
		 ref='tableData'>
			<el-table-column type="index" label="#" align="center"></el-table-column>
			<el-table-column prop="Color" label="颜色" align="center"></el-table-column>
			<el-table-column prop="Size" label="尺码" align="center"></el-table-column>
			<el-table-column prop="SizeColorASIN" label="ASIN" align="center"></el-table-column>
			<el-table-column prop="SizeColorNumber" label="库存" align="center"></el-table-column>
			<el-table-column prop="SizeColorPrice" label="原价" align="center"></el-table-column>
			<el-table-column prop="SizeColorDiscount" label="折扣" align="center">
				<template slot-scope="scope">
					<span>{{scope.row.SizeColorDiscount}}%</span>
				</template>
			</el-table-column>
			<el-table-column prop="SizeColorPresentPrice" label="现价" align="center"></el-table-column>
			<el-table-column label="操作" align="center" width="100">
				<template v-slot="scope">
					<el-button size="small" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--编辑界面-->
		<el-dialog :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal" width="60%"
		 append-to-body>
			<el-form :model="editForm" label-width="80px" :rules="rules" ref="editForm">
				<el-row>
					<el-col :span="6">
						<el-form-item label="颜色" prop="color">
							<el-select v-model="editForm.color" placeholder="请选择颜色" class="w100">
								<el-option v-for="item in colorData" :key="item.Id" :label="item.Color" :value="item.Id"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="尺码" prop="size">
							<el-select v-model="editForm.size" placeholder="请选择尺码" class="w100">
								<el-option v-for="item in sizeData" :key="item.Id" :label="item.Size" :value="item.Id"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="ASIN" prop="asin">
							<el-input v-model="editForm.asin"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="6">
						<el-form-item label="库存" prop="num">
							<el-input v-model="editForm.num"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="原价" prop="price">
							<el-input v-model="editForm.price"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="折扣" prop="discount">
							<el-input v-model="editForm.discount">
								<template slot="append">%</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="现价" class="disabled-font-color">
							<el-input v-model="nowPrice" :disabled="true"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeModal">取消</el-button>
				<el-button type="primary" v-if="doType==='add'" @click="addSubmit" :loading="btnLoading">提交</el-button>
				<el-button type="primary" v-if="doType==='edit'" @click="editSubmit" :loading="btnLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import {
		formatList,
		formatAdd,
		formatEdit,
		colorList,
		sizeList,
	} from '@/api/api'

	export default {
		name: 'type',
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
				colorData: [],
				sizeData: [],
				tableData: [],
				selsData: [],
				selectId: '',
				editForm: {
					color: '',
					size: '',
					asin: '',
					num: '',
					price: '',
					discount: ''
				},
				rules: {
					asin: [{
						required: true,
						message: '请输入ASIN',
						trigger: 'blur'
					}],
					num: [{
							required: true,
							message: '请输入库存数量',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]\d*$/,
							message: '库存数量必须为大于等于0的整数',
							trigger: 'blur'
						}
					],
					price: [{
							required: true,
							message: '请输入商品原价',
							trigger: 'blur'
						},
						{
							pattern: /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/,
							message: '金额格式不正确（大于0且最多2位小数）',
							trigger: 'blur'
						}
					],
					discount: [{
							required: true,
							message: '请输入商品折扣',
							trigger: 'blur'
						},
						{
							pattern: /^(?:[1-9]?\d|100)$/,
							message: '折扣必须为0-100的整数',
							trigger: 'blur'
						}
					],
					nowPrice: {
						required: true,
						message: '请输入现价',
						trigger: 'blur'
					}
				}
			}
		},
		props: ['productId'],
		computed: {
			//根据原价和折扣计算现价
			nowPrice: function() {
				let _this = this
				let price = Number(_this.editForm.price)
				let discount = Number(_this.editForm.discount)
				let res = (price * discount / 100).toFixed(2)
				return res
			}
		},
		created() {
			this.getData()
			this.getColorData()
			this.getSizeData()
		},
		methods: {
			// 获取颜色数据
			getColorData() {
				let _this = this
				let params = {
					ProductManageId: _this.productId
				}
				colorList(params).then(res => {
					_this.colorData = res.result
				}).catch((e) => {})
			},

			// 获取尺寸数据
			getSizeData() {
				let _this = this
				let params = {
					ProductManageId: _this.productId
				}
				sizeList(params).then(res => {
					_this.sizeData = res.result
				}).catch((e) => {})
			},

			// 获取列表数据
			getData() {
				let _this = this
				_this.listLoading = true
				let params = {
					ProductManageId: _this.productId
				}
				formatList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.result
				}).catch((e) => {})
			},

			// 显示新增框
			handleAdd() {
				let _this = this
				_this.title = '新增规格'
				_this.doType = 'add'
				_this.editModal = true
			},

			// 显示编辑框
			handleEdit(index, row) {
				let _this = this
				_this.title = '编辑规格'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editModal = true
				_this.editForm.color = row.ProductColorId
				_this.editForm.size = row.ProductSizeId
				_this.editForm.asin = row.SizeColorASIN
				_this.editForm.num = row.SizeColorNumber
				_this.editForm.price = row.SizeColorPrice
				_this.editForm.discount = row.SizeColorDiscount
			},

			//新增提交
			addSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						if (!_this.editForm.color && !_this.editForm.size) {
							_this.$message.error('颜色和尺码必须至少选择一项')
						} else {
							_this.btnLoading = true
							let params = {
								Id: _this.productId,
								Data: [{
									ProductColorId: _this.editForm.color,
									ProductSizeId: _this.editForm.size,
									SizeColorNumber: _this.editForm.num,
									SizeColorASIN: _this.editForm.asin,
									SizeColorPrice: _this.editForm.price,
									SizeColorDiscount: _this.editForm.discount,
									SizeColorPresentPrice: _this.nowPrice
								}]
							}
							formatAdd(params).then(res => {
								_this.btnLoading = false
								_this.closeModal()
								_this.getData()
							}).catch((e) => {
								_this.btnLoading = false
							})
						}
					}

				})
			},

			//编辑提交
			editSubmit() {
				let _this = this
				_this.$refs.editForm.validate((valid) => {
					if (valid) {
						if (!_this.editForm.color && !_this.editForm.size) {
							_this.$message.error('颜色和尺码必须至少选择一项')
						} else {
							_this.btnLoading = true
							let params = {
								Id: [_this.selectId],
								datas: [{
									Id: _this.selectId,
									ProductManageId: _this.productId,
									ProductColorId: _this.editForm.color,
									ProductSizeId: _this.editForm.size,
									SizeColorNumber: _this.editForm.num,
									SizeColorASIN: _this.editForm.asin,
									SizeColorPrice: _this.editForm.price,
									SizeColorDiscount: _this.editForm.discount,
									SizeColorPresentPrice: _this.nowPrice
								}]
							}
							formatEdit(params).then(res => {
								_this.btnLoading = false
								_this.closeModal()
								_this.getData()
							}).catch((e) => {
								_this.btnLoading = false
							})
						}
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
					color: '',
					size: '',
					asin: '',
					num: '',
					price: '',
					discount: ''
				}
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
