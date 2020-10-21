<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item label="商品搜索">
					<el-input size="small" v-model="searchForm.name" placeholder="请输入商品名称"></el-input>
				</el-form-item>
				<el-form-item label="所属国家">
					<el-select v-model="searchForm.country" placeholder="请选择所属国家" size="small">
						<el-option value="0" label="全部国家"></el-option>
						<el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName" :value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="优惠类别">
					<el-select v-model="searchForm.disType" placeholder="请选择优惠类别" size="small">
						<el-option value="0" label="全部类别"></el-option>
						<el-option v-for="item in disTypeData" :key="item.Id" :label="item.Name" :value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="商品类别">
					<el-select v-model="searchForm.type" placeholder="请选择所属类别" size="small">
						<el-option value="0" label="全部类别"></el-option>
						<el-option v-for="item in typeData" :key="item.Id" :label="item.Name" :value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="searchForm.state" placeholder="状态" size="small">
						<el-option value="0" label="全部状态"></el-option>
						<el-option value="-1" label="未上架"></el-option>
						<el-option value="1" label="已上架"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button size="small" @click="searchData">查询</el-button>
					<el-button size="small" @click="resetSearch">重置</el-button>
					<el-button size="small" type="primary" @click="handleAdd">新增</el-button>
					<el-button type="warning" size="small" @click="exportExcel">导出</el-button>
					<el-button type="danger" size="small" @click="drModal=true">导入商品</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table border :data="tableData" @selection-change="selsChange" @row-click="rowClick" v-loading="listLoading" style="width: 100%"
		 id="tableData" ref='tableData'>
			<el-table-column type="selection" align="center"></el-table-column>
			<el-table-column type="index" label="#" align="center"></el-table-column>
			<el-table-column prop="ProductName" label="商品名称" align="center" :show-overflow-tooltip='true'></el-table-column>
			<el-table-column prop="picture" label="商品图" align="center">
				<template slot-scope="scope">
					<img style="width: 40px;height: 40px;" v-if="scope.row.ProductUrl" :src="scope.row.ProductUrl" @click.stop="showImage(scope.row.ProductUrl)" />
				</template>
			</el-table-column>
			<el-table-column prop="CountryName" label="所属国家" align="center"></el-table-column>
			<el-table-column prop="DiscountsTypeName" label="优惠类别" align="center"></el-table-column>
			<el-table-column prop="ProductTypeName" label="商品类别" align="center"></el-table-column>
			<el-table-column prop="Grade" label="商品等级" align="center"></el-table-column>
			<el-table-column prop="Number" label="库存" align="center"></el-table-column>
			<el-table-column prop="PresentPrice" label="现价" align="center">
				<template slot-scope="scope">
					<span>{{scope.row.Price}} {{scope.row.Currency}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="AddTime" label="添加时间" align="center"></el-table-column>
			<el-table-column prop="State" label="状态" align="center">
				<template slot-scope="scope">
					<el-tag size="small" type="danger" v-if="scope.row.State===-1">未上架</el-tag>
					<el-tag size="small" type="success" v-if="scope.row.State===1">已上架</el-tag>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="100">
				<template v-slot="scope">
					<el-button size="small" type="primary" @click.stop="handleEdit(scope.$index, scope.row)">编辑</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button size="small" type="success" @click="handleState(1)" :disabled="selsData.length<1">上架</el-button>
			<el-button size="small" type="warning" @click="handleState(-1)" :disabled="selsData.length<1">下架</el-button>
			<el-button size="small" type="danger" @click="handleDelete()" :disabled="selsData.length<1">删除</el-button>
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
			 :current-page="pageIndex" :page-sizes="[10, 20, 50, 100,1000]" :page-size="10" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog :title="title" :visible.sync="editModal" :close-on-click-modal="false" :before-close="closeModal" width="70%">
			<el-form :model="editForm" label-width="100px" :rules="rules" ref="editForm">
				<el-row>
					<el-col :span="24">
						<!-- 新增页面商品图片 图片文件与表单数据一起提交-->
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
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="商品名称" prop="name">
							<el-input v-model="editForm.name"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="所属国家" prop="country">
							<el-select v-model="editForm.country" placeholder="请选择所属国家" class="w100" @change="getCurrency">
								<el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName" :value="item.Id"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="优惠类别" prop="disType">
							<el-select v-model="editForm.disType" placeholder="请选择优惠类别" class="w100">
								<el-option v-for="item in disTypeData" :key="item.Id" :label="item.Name" :value="item.Id"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="商品类别" prop="type">
							<el-select v-model="editForm.type" placeholder="请选择所属类别" class="w100">
								<el-option v-for="item in typeData" :key="item.Id" :label="item.Name" :value="item.Id"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="商品等级" prop="level">
							<el-select v-model="editForm.level" placeholder="请选择商品等级" class="w100">
								<el-option v-for="item in levelData" :key="item" :label="item" :value="item"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="店铺" prop="shop">
							<el-input v-model="editForm.shop"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="ASIN" prop="asin">
							<el-input v-model="editForm.asin"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="关键词" prop="keyWord">
							<el-input v-model="editForm.keyWord"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="品牌" prop="brand">
							<el-input v-model="editForm.brand"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="商品位置" prop="place">
							<el-input v-model="editForm.place"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="库存" prop="num">
							<el-input v-model="editForm.num"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="原价" prop="price">
							<el-input v-model="editForm.price">
								<template slot="append">{{editForm.currency}}</template>
							</el-input>
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
							<el-input v-model="nowPrice" :disabled="true">
								<template slot="append">{{editForm.currency}}</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="积分" prop="integral">
							<el-input v-model="editForm.integral"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="佣金" prop="commission">
							<el-input v-model="editForm.commission">
								<template slot="append">{{editForm.currency}}</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="客户编码" prop="code">
							<el-input v-model="editForm.code"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="商品描述" prop="description">
							<quill-editor v-model="editForm.description" ref="myQuillEditor" class="editor-box" :options="editorOption"></quill-editor>
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

		<!-- 图片大图预览 -->
		<el-dialog title="图片预览" :visible.sync="ViewImageModal" width="60%">
			<div class="txt-c">
				<img :src='ViewImageUrl' />
			</div>
		</el-dialog>

		<!-- 商品Excel文件导入 -->
		<el-dialog title="【商品】Excel文件导入" :visible.sync="drModal" :close-on-click-modal="false" :before-close="closeDrModal"
		 width="30%">
			<el-form ref="drForm" class="txt-c">
				<el-link type="primary" class="mb20" :underline="false" href="/template/商品导入模板.xlsx">
					<el-button size="mini" type="primary">下载商品导入Excel模板</el-button>
				</el-link>
				<el-upload ref="upload" :limit="1" drag action="/api/ProductManage/ImportExcel" multiple :on-success="handleAvatarSuccess"
				 :on-error="handleError" :before-upload="beforeAvatarUpload" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
					<i class="el-icon-upload"></i>
					<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em>
						<p class="danger">只能上传规范的Excel文件</p><br>
					</div>
				</el-upload>
			</el-form>
		</el-dialog>

	</section>
</template>

<script>
	import FileSaver from 'file-saver'
	import XLSX from 'xlsx'

	import {
		productList,
		productAdd,
		productEdit,
		productState,
		productDelete,
		countryList,
		typeList,
		discountsType
	} from '@/api/api'

	import {
		quillEditor
	} from 'vue-quill-editor'
	import 'quill/dist/quill.core.css'
	import 'quill/dist/quill.snow.css'
	import 'quill/dist/quill.bubble.css'

	export default {
		name: 'product',
		components: {
			quillEditor
		},
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
				typeData: [],
				disTypeData: [],
				levelData: ['A', 'B', 'C', 'D', 'E', 'F'],
				selsData: [],
				selectId: '',
				searchForm: {
					name: '',
					country: '0',
					disType: '0',
					type: '0',
					state: '0'
				},
				editForm: {
					name: '',
					country: '',
					disType: '',
					type: '',
					level: '',
					shop: '',
					asin: '',
					keyWord: '',
					brand: '',
					place: '',
					num: '',
					price: '',
					discount: '',
					commission: '',
					integral: '',
					description: '',
					code: ''
				},
				drModal: false,
				fileListAdd: [],
				hideUploadAdd: false,
				fileListData: [],
				disUpload: false,
				editorOption: {
					placeholder: '',
					theme: 'snow',
				},
				ViewImageModal: false,
				ViewImageUrl: '',
				rules: {
					name: {
						required: true,
						message: '请输入商品名称',
						trigger: 'blur'
					},
					country: {
						required: true,
						message: '请选择所属国家',
						trigger: 'blur'
					},
					disType: {
						required: true,
						message: '请选择优惠类别',
						trigger: 'blur'
					},
					type: {
						required: true,
						message: '请选择商品类别',
						trigger: 'blur'
					},
					level: {
						required: true,
						message: '请选择商品等级',
						trigger: 'blur'
					},
					shop: {
						required: true,
						message: '请输入店铺名',
						trigger: 'blur'
					},
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
							pattern: /^[1-9]\d*$/,
							message: '库存数量必须为大于0的正整数',
							trigger: 'blur'
						}
					],
					price: [{
							required: true,
							message: '请输入商品原价',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
							message: '金额格式不正确',
							trigger: 'blur'
						}
					],
					discount: [{
							required: true,
							message: '请输入商品折扣',
							trigger: 'blur'
						},
						{
							pattern: /^[0-9]\d*$/,
							message: '折扣必须为整数',
							trigger: 'blur'
						}
					],
					commission: {
						pattern: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
						message: '金额格式不正确',
						trigger: 'blur'
					},
					integral: {
						pattern: /^[0-9]\d*$/,
						message: '积分必须为整数',
						trigger: 'blur'
					}
				}
			}
		},
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
			this.getCountryData()
			this.getTypeData()
			this.getDisTypeData()
		},
		methods: {
			// 获取列表数据
			getData() {
				let _this = this
				_this.listLoading = true
				let params = {
					TradeName: _this.searchForm.name,
					CountryId: _this.searchForm.country,
					DiscountsTypeId: _this.searchForm.disType,
					ProductTypeId: _this.searchForm.type,
					State: _this.searchForm.state,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}
				productList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.result.Entity
					_this.total = Number(res.result.TotalCount)
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

			//选择国家后获取货币
			getCurrency() {
				let _this = this
				let countryData = _this.countryData
				let country = _this.editForm.country
				for (let x in countryData) {
					if (country == countryData[x].Id)
						_this.editForm.currency = countryData[x].Currency
				}
			},

			// 获取商品类别数据
			getTypeData() {
				let _this = this
				let params = {
					Name: '',
					pageIndex: 1,
					pageSize: 100000000
				}
				typeList(params).then(res => {
					_this.typeData = res.Entity
				}).catch((e) => {})
			},

			// 获取优惠类别数据
			getDisTypeData() {
				let _this = this
				let params = {}
				discountsType(params).then(res => {
					_this.disTypeData = res.result
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
						name: '',
						country: '0',
						disType: '0',
						type: '0',
						state: '0'
					},
					_this.getData()
			},

			// 显示新增框
			handleAdd() {
				let _this = this
				_this.title = '新增商品'
				_this.doType = 'add'
				_this.editModal = true
			},

			// 显示编辑框
			handleEdit(index, row) {
				let _this = this
				_this.title = '编辑商品'
				_this.doType = 'edit'
				_this.selectId = row.Id
				_this.editModal = true
				_this.editForm.name = row.ProductName
				_this.editForm.country = Number(row.CountryId)
				_this.editForm.disType = Number(row.DiscountsTypeId)
				_this.editForm.type = Number(row.ProductTypeId)
				_this.editForm.level = row.Grade
				_this.editForm.shop = row.Shop
				_this.editForm.asin = row.ASIN
				_this.editForm.keyWord = row.KeyWord
				_this.editForm.brand = row.Brand
				_this.editForm.place = row.Place
				_this.editForm.num = row.Number
				_this.editForm.price = row.Price
				_this.editForm.discount = row.Discount
				_this.editForm.commission = row.Commission
				_this.editForm.integral = row.Integral
				_this.editForm.code = row.UserId
				_this.editForm.currency = row.Currency
				_this.editForm.description = row.ProductDescribe

				//图片转换为 url:'xxx' 格式才能回显
				let img = ''
				if (row.ProductUrl) {
					if (row.Subgraph) {
						img = row.ProductUrl + ',' + row.Subgraph
					} else {
						img = row.ProductUrl
					}
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
					name: '',
					country: '',
					disType: '',
					type: '',
					level: '',
					shop: '',
					asin: '',
					keyWord: '',
					brand: '',
					place: '',
					num: '',
					price: '',
					discount: '',
					commission: '',
					integral: '',
					description: '',
					code: ''
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
						let params = new FormData()
						params.append('ProductName', _this.editForm.name)
						params.append('CountryId', _this.editForm.country)
						params.append('DiscountsTypeId', _this.editForm.disType)
						params.append('ProductTypeId', _this.editForm.type)
						params.append('Grade', _this.editForm.level)
						params.append('Shop', _this.editForm.shop)
						params.append('ASIN', _this.editForm.asin)
						params.append('KeyWord', _this.editForm.keyWord)
						params.append('Brand', _this.editForm.brand)
						params.append('Place', _this.editForm.place)
						params.append('Number', _this.editForm.num)
						params.append('Price', _this.editForm.price)
						params.append('Discount', _this.editForm.discount)
						params.append('PresentPrice', _this.nowPrice)
						params.append('Commission', _this.editForm.commission)
						params.append('Integral', _this.editForm.integral)
						params.append('ProductDescribe', _this.editForm.description)
						params.append('UserId', _this.editForm.code)
						_this.fileListAdd.map(item => {
							params.append("image", item.raw);
						})

						productAdd(params).then(res => {
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
						let params = new FormData()
						params.append('Id', _this.selectId)
						params.append('ProductName', _this.editForm.name)
						params.append('CountryId', _this.editForm.country)
						params.append('DiscountsTypeId', _this.editForm.disType)
						params.append('ProductTypeId', _this.editForm.type)
						params.append('Grade', _this.editForm.level)
						params.append('Shop', _this.editForm.shop)
						params.append('ASIN', _this.editForm.asin)
						params.append('KeyWord', _this.editForm.keyWord)
						params.append('Brand', _this.editForm.brand)
						params.append('Place', _this.editForm.place)
						params.append('Number', _this.editForm.num)
						params.append('Price', _this.editForm.price)
						params.append('Discount', _this.editForm.discount)
						params.append('PresentPrice', _this.nowPrice)
						params.append('Commission', _this.editForm.commission)
						params.append('Integral', _this.editForm.integral)
						params.append('ProductDescribe', _this.editForm.description)
						params.append('UserId', _this.editForm.code)
						_this.fileListAdd.map(item => {
							params.append("image", item.raw);
						});

						productEdit(params).then(res => {
							_this.btnLoading = false
							_this.closeModal()
							_this.getData()
						}).catch((e) => {
							_this.btnLoading = false
						})
					}
				})
			},

			//商品上架下架
			handleState(val) {
				let _this = this
				let txt = ''
				if (val == 1) {
					txt = '上架'
				}
				if (val == -1) {
					txt = '下架'
				}
				let ids = _this.selsData.map(item => item.Id) //选中的数据
				let num = _this.selsData.length //选中的数量
				_this.$confirm('确认【' + txt + '】选中的【' + num + '】个商品吗？', '信息提示', {
					type: 'warning'
				}).then(() => {
					let params = {
						Id: ids,
						State: val
					}
					productState(params).then((res) => {
						_this.getData()
					})
				}).catch(() => {})
			},

			//商品删除
			handleDelete() {
				let _this = this
				let ids = _this.selsData.map(item => item.Id) //选中的数据
				let num = _this.selsData.length //选中的数量
				_this.$confirm('确认【 删除 】选中的【' + num + '】个商品吗？', '信息提示', {
					type: 'warning'
				}).then(() => {
					let params = {
						Id: ids
					}
					productDelete(params).then((res) => {
						_this.getData()
					})
				}).catch(() => {})
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

			// 文件上传
			handleAvatarSuccess(res, file) {
				if (res.IsSuccess) {
					this.$message.success('文件导入成功！')
					this.getData()
				} else {
					this.$message.error('文件导入失败！')
				}
			},
			handleError(res) {
				this.$message.error('文件导入失败！')
			},
			beforeAvatarUpload(file) {
				const isXLS = file.type === 'application/vnd.ms-excel';
				const isSLSX = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
				if (!isXLS && !isSLSX) {
					this.$message.error('上传的文件必须为Excel');
				}
				return (isXLS || isSLSX)
			},

			//关闭文件上传框
			closeDrModal() {
				let _this = this
				_this.drModal = false
				_this.$refs.upload.clearFiles()
			},

			//选中行
			rowClick(row) {
				let _this = this
				let findResult = _this.selsData.findIndex((value, index) => {
					return value == row
				})
				if (findResult != -1) {
					_this.$refs.tableData.toggleRowSelection(row, false);
				} else {
					_this.$refs.tableData.toggleRowSelection(row, true);
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
			},

			// 导出
			exportExcel() {
				var wb = XLSX.utils.table_to_book(document.querySelector('#tableData'))
				var wbout = XLSX.write(wb, {
					bookType: 'xlsx',
					bookSST: true,
					type: 'array'
				})
				try {
					FileSaver.saveAs(new Blob([wbout], {
						type: 'application/octet-stream'
					}), '商品信息.xlsx')
				} catch (e) {
					if (typeof console !== 'undefined') {
						console.log(e, wbout)
					}
				}
				return wbout
			}

		}
	}
</script>
