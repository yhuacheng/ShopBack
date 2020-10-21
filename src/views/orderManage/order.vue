<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item label="搜索内容">
					<el-input size="small" v-model="searchForm.keyword" placeholder="订单"></el-input>
				</el-form-item>
				<el-form-item label="购买时间">
					<el-date-picker size="small" v-model="searchForm.time" :unlink-panels='true' type="datetimerange" range-separator="至"
					 start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="searchForm.state" placeholder="状态" size="small">
						<el-option value="0" label="全部状态"></el-option>
						<el-option value="1" label="待购买"></el-option>
						<el-option value="2" label="待确认购买"></el-option>
						<el-option value="3" label="待评价"></el-option>
						<el-option value="4" label="待确认评价"></el-option>
						<el-option value="5" label="已确认评价"></el-option>
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
		<el-table border :data="tableData" @selection-change="selsChange" @row-click="rowClick" v-loading="listLoading" style="width: 100%"
		 id="tableData" ref='tableData'>
			<el-table-column type="selection" align="center"></el-table-column>
			<el-table-column type="index" label="#" align="center"></el-table-column>
			<el-table-column prop="No" label="订单编号" align="center"></el-table-column>
			<el-table-column prop="disType" label="商品编号" align="center"></el-table-column>
			<el-table-column prop="country" label="买家账号" align="center"></el-table-column>
			<el-table-column prop="type" label="购买数量" align="center"></el-table-column>
			<el-table-column prop="shop" label="购买价格" align="center"></el-table-column>
			<el-table-column prop="shop" label="下单时间" align="center"></el-table-column>
			<el-table-column prop="ASIN" label="亚马逊单号" align="center"></el-table-column>
			<el-table-column prop="ASIN" label="评价" align="center"></el-table-column>
			<el-table-column prop="State" label="状态" align="center">
				<template slot-scope="scope">
					<el-tag size="small" type="info" v-if="scope.row.State===1">待购买</el-tag>
					<el-tag size="small" type="primary" v-if="scope.row.State===2">待确认购买</el-tag>
					<el-tag size="small" type="warning" v-if="scope.row.State===3">待评价</el-tag>
					<el-tag size="small" type="primary" v-if="scope.row.State===4">待确认评价</el-tag>
					<el-tag size="small" type="success" v-if="scope.row.State===5">已确认评价</el-tag>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" width="250">
				<template v-slot="scope">
					<el-button size="small" type="primary" @click.stop="handleEdit(scope.$index, scope.row)">确认购买</el-button>
					<el-button size="small" type="success" @click.stop="handleEdit(scope.$index, scope.row)">确认评价</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
			 :current-page="pageNum" :page-sizes="[10, 20, 50, 100,1000]" :page-size="10" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-col>

	</section>
</template>

<script>
	import FileSaver from 'file-saver'
	import XLSX from 'xlsx'

	import {
		orderSearchList,
		orderSearchState
	} from '@/api/api'

	export default {
		name: 'order',
		data() {
			return {
				title: '',
				pageNum: 1,
				pageSize: 10,
				total: 0,
				doType: '',
				editModal: false,
				listLoading: false,
				btnLoading: false,
				tableData: [{"No":"001"}],
				selsData: [],
				selectId: '',
				searchForm: {
					keyword: '',
					time: [],
					state: '0'
				}
			}
		},
		created() {
			// this.getData()
		},
		methods: {
			// 获取列表数据
			getData() {
				let _this = this
				_this.listLoading = true
				let params = {
					KeyWord: _this.searchForm.keyword,
					Statetime: '',
					Endtime: '',
					State: _this.searchForm.state,
					pageNum: _this.pageNum,
					pagesize: _this.pageSize
				}
				orderSearchList(params).then(res => {
					_this.listLoading = false
					_this.tableData = res.list
					_this.total = Number(res.total)
				}).catch((e) => {})
			},

			//查询
			searchData() {
				let _this = this
				_this.pageNum = 1
				_this.getData()
			},

			//重置
			resetSearch() {
				let _this = this
				_this.pageNum = 1
				_this.searchForm = {
						keyword: '',
						time: [],
						state: '0'
					},
					_this.getData()
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
				_this.pageNum = val
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
					}), '订单信息.xlsx')
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
