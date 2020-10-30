<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item label="搜索内容">
					<el-input size="small" v-model="searchForm.keyword" placeholder="产品名/店铺名/ASIN/买家ID"></el-input>
				</el-form-item>
				<el-form-item label="国家" prop="country">
					<el-select v-model="searchForm.country" placeholder="请选择国家" size="small">
						<el-option value="0" label="全部国家"></el-option>
						<el-option v-for="item in countryData" :key="item.Id" :label="item.CountryName" :value="item.Id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="下单时间">
					<el-date-picker size="small" v-model="searchForm.time" :unlink-panels='true' type="datetimerange" range-separator="至"
					 start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="searchForm.state" placeholder="状态" size="small">
						<el-option value="0" label="全部状态"></el-option>
						<el-option value="-1" label="待购买"></el-option>
						<el-option value="1" label="待审核购买"></el-option>
						<el-option value="2" label="待评价"></el-option>
						<el-option value="3" label="待审核评价"></el-option>
						<el-option value="4" label="已完成"></el-option>
						<el-option value="5" label="失败"></el-option>
						<el-option value="-2" label="已取消"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button size="small" @click="searchData">查询</el-button>
					<el-button size="small" @click="resetSearch">重置</el-button>
					<el-button type="warning" size="small" @click="exportExcel">导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table border :data="tableData" @selection-change="selsChange" v-loading="listLoading" style="width: 100%" id="tableData"
		 ref='tableData'>
			<el-table-column type="index" label="#" align="center"></el-table-column>
			<el-table-column prop="ProductName" label="商品名称" align="center" :show-overflow-tooltip='true'></el-table-column>
			<el-table-column prop="ProductUrl" label="商品图" align="center">
				<template slot-scope="scope">
					<img style="width: 40px;height: 40px;" v-if="scope.row.ProductUrl" :src="scope.row.ProductUrl" @click.stop="showImage(scope.row.ProductUrl)" />
				</template>
			</el-table-column>
			<el-table-column prop="CountryName" label="国家" align="center"></el-table-column>
			<el-table-column prop="Shop" label="店铺" align="center" :show-overflow-tooltip='true'></el-table-column>
			<el-table-column prop="ASIN" label="ASIN" align="center"></el-table-column>
			<el-table-column prop="BuyerId" label="买家ID" align="center"></el-table-column>
			<el-table-column prop="PresentPrice" label="购买价格" align="center">
				<template slot-scope="scope">
					<div>{{scope.row.PresentPrice}}{{scope.row.Currency}}</div>
					<div v-if="scope.row.Integral>0">+{{scope.row.Integral}}积分</div>
				</template>
			</el-table-column>
			<el-table-column prop="Commission" label="佣金" align="center">
				<template slot-scope="scope">
					<span>{{scope.row.Commission}}{{scope.row.Currency}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="AddTime" label="下单时间" align="center"></el-table-column>
			<el-table-column prop="AmazonNumber" label="亚马逊单号" align="center"></el-table-column>
			<el-table-column prop="BuyTime" label="购买时间" align="center"></el-table-column>
			<el-table-column prop="CommontLink" label="评价链接" align="center"></el-table-column>
			<el-table-column prop="CommontImage" label="评价截图" align="center">
				<template slot-scope="scope">
					<img style="width: 40px;height: 40px;" v-if="scope.row.CommontImage" :src="$IMGURL+scope.row.CommontImage"
					 @click.stop="showImage($IMGURL+scope.row.CommontImage)" />
				</template>
			</el-table-column>
			<el-table-column prop="State" label="状态" align="center" width="100">
				<template slot-scope="scope">
					<el-tag size="small" type="info" v-if="scope.row.State==-1">待购买</el-tag>
					<el-tag size="small" type="warning" v-if="scope.row.State==1">待审核购买</el-tag>
					<el-tag size="small" type="warning" v-if="scope.row.State==2">待评价</el-tag>
					<el-tag size="small" type="warning" v-if="scope.row.State==3">待审核评价</el-tag>
					<el-tag size="small" type="success" v-if="scope.row.State==4">已完成</el-tag>
					<el-tag size="small" type="danger" v-if="scope.row.State==5">失败</el-tag>
					<el-tag size="small" type="danger" v-if="scope.row.State==-2">已取消</el-tag>
					<div v-if="scope.row.Remark" class="danger">{{scope.row.Remark}}</div>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="200">
				<template v-slot="scope">
					<el-button size="small" type="primary" v-if="scope.row.State==1" @click="handleCheckBuy(scope.$index, scope.row)">审核购买</el-button>
					<el-button size="small" type="warning" v-if="scope.row.State==3" @click="handleCheckReview(scope.$index, scope.row)">审核评价</el-button>
					<el-button size="small" type="danger" @click="handleCancel(scope.$index, scope.row)">取消</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
			 :current-page="pageIndex" :page-sizes="[10, 20, 50, 100,1000]" :page-size="10" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-col>

		<!-- 审核购买 -->
		<el-dialog :title="title" :visible.sync="checkBuyModal" :close-on-click-modal="false" :before-close="closeCheckBuyModal"
		 width="30%">
			<el-form :model="infoForm" label-width="100px">
				<el-form-item label="商品名称：">
					<span>{{infoForm.productName}}</span>
				</el-form-item>
				<el-form-item label="国家：">
					<span>{{infoForm.country}}</span>
				</el-form-item>
				<el-form-item label="店铺：">
					<span>{{infoForm.shopName}}</span>
				</el-form-item>
				<el-form-item label="ASIN：">
					<span>{{infoForm.asin}}</span>
				</el-form-item>
				<p style="height: 1px;border-top: 1px solid #DDDDDD;"></p>
				<el-form-item label="亚马逊单号：">
					<span class="warning">{{infoForm.amazonNo}}</span>
				</el-form-item>
			</el-form>
			<el-form :model="checkBuyForm" label-width="100px" :rules="checkBuyRules" ref="checkBuyForm">
				<el-form-item label="审核结果：" prop="state">
					<el-radio-group v-model="checkBuyForm.state">
						<el-radio :label="1">审核通过</el-radio>
						<el-radio :label="2">审核不通过</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-if="checkBuyForm.state==2" label="原因：" prop="remark">
					<el-input v-model="checkBuyForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeCheckBuyModal">取消</el-button>
				<el-button type="primary" @click="checkBuySubmit" :loading="btnLoading">确定</el-button>
			</div>
		</el-dialog>

		<!-- 审核评价 -->
		<el-dialog :title="title" :visible.sync="checkReviewModal" :close-on-click-modal="false" :before-close="closeCheckReviewModal"
		 width="30%">
			<el-form :model="infoForm" label-width="100px" size="mini">
				<el-form-item label="商品名称：">
					<span>{{infoForm.productName}}</span>
				</el-form-item>
				<el-form-item label="国家：">
					<span>{{infoForm.country}}</span>
				</el-form-item>
				<el-form-item label="店铺：">
					<span>{{infoForm.shopName}}</span>
				</el-form-item>
				<el-form-item label="ASIN：">
					<span>{{infoForm.asin}}</span>
				</el-form-item>
				<p style="height: 1px;border-top: 1px solid #DDDDDD;"></p>
				<el-form-item label="亚马逊单号：">
					<span class="warning">{{infoForm.amazonNo}}</span>
				</el-form-item>
				<el-form-item label="评价链接：">
					<el-link :underline="false" v-if="infoForm.reviewLink" :href="infoForm.reviewLink" target="_blank" type="primary">{{infoForm.reviewLink}}</el-link>
				</el-form-item>
				<el-form-item label="评价截图：">
					<el-link :underline="false" v-if="infoForm.reviewImg" :href="$IMGURL+infoForm.reviewImg" target="_blank">
						<span class="success">温馨提示：点击图片可查看原图</span>
						<img :src="$IMGURL+infoForm.reviewImg" style="width: 100%;height: 100px;" />
					</el-link>
				</el-form-item>
			</el-form>
			<el-form :model="checkReviewForm" label-width="100px" :rules="checkReviewRules" ref="checkReviewForm">
				<el-form-item label="审核结果：" prop="state">
					<el-radio-group v-model="checkReviewForm.state">
						<el-radio :label="1">审核通过</el-radio>
						<el-radio :label="2">审核不通过</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-if="checkReviewForm.state==2" label="原因：" prop="remark">
					<el-input v-model="checkReviewForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="closeCheckReviewModal">取消</el-button>
				<el-button type="primary" @click="checkReviewSubmit" :loading="btnLoading">确定</el-button>
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
	import table2excel from 'js-table2excel'

	import {
		orderList,
		countryList
	} from '@/api/api'

	export default {
		name: 'order',
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
					keyword: '',
					time: [],
					state: '0'
				},
				ViewImageModal: false,
				ViewImageUrl: '',
				infoForm: {
					productName: '',
					country: '',
					shopName: '',
					asin: '',
					amazonNo: '',
					reviewLink: '',
					reviewImg: []
				},
				checkBuyModal: false,
				checkReviewModal: false,
				checkBuyForm: {
					state: 1,
					remark: ''
				},
				checkBuyRules: {
					remark: {
						required: true,
						message: '必须填写原因',
						trigger: 'blur'
					}
				},
				checkReviewForm: {
					state: 1,
					remark: ''
				},
				checkReviewRules: {
					remark: {
						required: true,
						message: '必须填写原因',
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

			// 获取列表数据
			getData() {
				let _this = this
				_this.listLoading = true
				let time = _this.searchForm.time
				let time1 = ''
				let time2 = ''
				if (time != '' && time != null) {
					time1 = time[0]
					time2 = time[1]
				}
				let params = {
					KeyWord: _this.searchForm.keyword,
					StartTime: time1,
					Endtime: time2,
					State: _this.searchForm.state,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}
				orderList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.result.Entity
					_this.total = Number(res.result.TotalCount)
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
						keyword: '',
						time: [],
						state: '0'
					},
					_this.getData()
			},

			//显示购买审核窗口
			handleCheckBuy(index, row) {
				let _this = this
				_this.title = '审核购买单号'
				_this.checkBuyModal = true
				_this.infoForm.orderId = row.Id
				_this.infoForm.productName = row.ProductName
				_this.infoForm.country = row.CountryName
				_this.infoForm.shopName = row.Shop
				_this.infoForm.asin = row.ASIN
				_this.infoForm.amazonNo = row.AmazonNumber
			},

			//提交购买审核结果
			checkBuySubmit() {
				let _this = this
				_this.$refs.checkBuyForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							Id: _this.infoForm.orderId,
							Type: _this.checkBuyForm.state,
							Remark: _this.checkBuyForm.remark
						}
						// countryAdd(params).then(res => {
						// 	_this.btnLoading = false
						// 	_this.closeModal()
						// 	_this.getData()
						// }).catch((e) => {
						// 	_this.btnLoading = false
						// })
					}
				})
			},

			//关闭购买审核窗口
			closeCheckBuyModal() {
				let _this = this
				_this.checkBuyModal = false
				_this.btnLoading = false
				_this.$refs['checkBuyForm'].resetFields()
				_this.checkBuyForm = {
					state: 1,
					remark: ''
				}
			},

			//显示评价审核窗口
			handleCheckReview(index, row) {
				let _this = this
				_this.title = '审核评价'
				_this.checkReviewModal = true
				_this.infoForm.orderId = row.Id
				_this.infoForm.orderId = row.Id
				_this.infoForm.productName = row.ProductName
				_this.infoForm.country = row.CountryName
				_this.infoForm.shopName = row.Shop
				_this.infoForm.asin = row.ASIN
				_this.infoForm.amazonNo = row.AmazonNumber
				_this.infoForm.reviewLink = row.CommontLink
				_this.infoForm.reviewImg = row.CommontImage
			},

			//提交评价审核结果
			checkReviewSubmit() {
				let _this = this
				_this.$refs.checkReviewForm.validate((valid) => {
					if (valid) {
						_this.btnLoading = true
						let params = {
							Id: _this.infoForm.orderId,
							Type: _this.checkReviewForm.state,
							Remark: _this.checkReviewForm.remark
						}
						// countryAdd(params).then(res => {
						// 	_this.btnLoading = false
						// 	_this.closeModal()
						// 	_this.getData()
						// }).catch((e) => {
						// 	_this.btnLoading = false
						// })
					}
				})
			},

			//关闭评价审核窗口
			closeCheckReviewModal() {
				let _this = this
				_this.checkReviewModal = false
				_this.btnLoading = false
				_this.$refs['checkReviewForm'].resetFields()
				_this.checkReviewForm = {
					state: 1,
					remark: ''
				}
			},

			//取消订单
			handleCancel(index, row) {
				let _this = this
				_this.$prompt('您将要取消买家ID为 ' + row.BuyerId + ' 的订单，请输入取消原因', '取消订单', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputPattern: /\S/,
					inputErrorMessage: '取消原因不能为空'
				}).then(({
					value
				}) => {
					// _this.checkPhoneCode(value)
				}).catch(() => {})
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

			//查看大图
			showImage(url) {
				let _this = this
				_this.ViewImageModal = true
				_this.ViewImageUrl = url
			},

			// 导出
			exportExcel() {
				const column = [{
						title: '商品名称',
						key: 'ProductName',
						type: 'text'
					},
					{
						title: '商品图',
						key: 'ExpProductUrl',
						type: 'image',
						width: 100,
						height: 100
					},
					{
						title: '国家',
						key: 'CountryName',
						type: 'text'
					},
					{
						title: '店铺',
						key: 'Shop',
						type: 'text'
					},
					{
						title: 'ASIN',
						key: 'ASIN',
						type: 'text'
					},
					{
						title: '购买价格',
						key: 'ExpPresentPrice',
						type: 'text'
					},
					{
						title: '佣金',
						key: 'ExpCommission',
						type: 'text'
					},
					{
						title: '下单时间',
						key: 'AddTime',
						type: 'text'
					},
					{
						title: '亚马逊单号',
						key: 'AmazonNumber',
						type: 'text'
					},
					{
						title: '购买时间',
						key: 'BuyTime',
						type: 'text'
					},
					{
						title: '评价链接',
						key: 'CommontLink',
						type: 'text'
					},
					{
						title: '评价截图',
						key: 'ExpCommontImage',
						type: 'image',
						width: 100,
						height: 100
					},
					{
						title: '备注',
						key: 'Remark',
						type: 'text'
					},
					{
						title: '状态',
						key: 'ExpState',
						type: 'text'
					},
				]
				const data = this.tableData
				for (const t in data) {
					data[t].ExpProductUrl = this.$IMGURLBACK + data[t].ProductUrl
					if (data[t].ExpCommontImage) {
						data[t].ExpCommontImage = this.$IMGURL + data[t].CommontImage
					}
					let TxtState = ''
					if (data[t].State == -1) {
						TxtState = '待购买'
					}
					if (data[t].State == 1) {
						TxtState = '待审核购买'
					}
					if (data[t].State == 2) {
						TxtState = '待评价'
					}
					if (data[t].State == 3) {
						TxtState = '待审核评价'
					}
					if (data[t].State == 4) {
						TxtState = '已完成'
					}
					if (data[t].State == 5) {
						TxtState = '失败'
					}
					if (data[t].State == -2) {
						TxtState = '已取消'
					}
					data[t].ExpState = TxtState
					data[t].ExpPresentPrice = data[t].PresentPrice + data[t].Currency
					let Integral = data[t].Integral
					if (Integral > 0) {
						data[t].ExpPresentPrice += '+' + Integral + '积分'
					}
					data[t].ExpDiscount = data[t].Discount + '%'
					data[t].ExpCommission = data[t].Commission + data[t].Currency
				}

				let date = new Date()
				let year = date.getFullYear()
				let month = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
				let day = date.getDate() <= 9 ? "0" + date.getDate() : date.getDate()
				let time = year + '-' + month + '-' + day

				const excelName = '订单信息' + '_' + time + '.xls'
				table2excel(column, data, excelName)
			}

		}
	}
</script>
