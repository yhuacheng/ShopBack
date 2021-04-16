<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item label="点赞时间">
					<el-date-picker size="small" v-model="searchForm.time" :unlink-panels='true' type="datetimerange"
						range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间"
						value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="searchForm.state" placeholder="状态" size="small">
						<el-option value="0" label="全部状态"></el-option>
						<el-option value="1" label="赞"></el-option>
						<el-option value="-1" label="取消赞"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button size="small" @click="searchData">查询</el-button>
					<el-button size="small" @click="resetSearch">重置</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table border :data="tableData" @selection-change="selsChange" v-loading="listLoading" style="width: 100%"
			id="tableData" ref='tableData'>
			<el-table-column type="index" label="#" align="center"></el-table-column>
			<el-table-column prop="BuyerId" label="点赞人ID" align="center"></el-table-column>
			<el-table-column prop="Email" label="点赞人邮箱" align="center"></el-table-column>
			<el-table-column prop="AddTime" label="点赞时间" align="center"></el-table-column>
			<el-table-column prop="ProductMangeId" label="被赞商品ID" align="center"></el-table-column>
			<el-table-column prop="ProductName" label="被赞商品名称" align="center" :show-overflow-tooltip='true'>
			</el-table-column>
			<el-table-column prop="ASIN" label="被赞商品ASIN" align="center"></el-table-column>
			<el-table-column prop="State" label="状态" align="center">
				<template v-slot="scope">
					<span class="success" v-if="scope.row.State=='1'">赞</span>
					<span class="danger" v-if="scope.row.State=='-1'">取消赞</span>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination style="float: right;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
				:current-page="pageIndex" :page-sizes="[10, 20, 50, 100]" :page-size="10"
				layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-col>
	</section>
</template>

<script>
	import {
		likeList
	} from '@/api/api'

	export default {
		name: 'like',
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
				searchForm: {
					time: [],
					state: '0'
				}
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
				let time = _this.searchForm.time
				let time1 = ''
				let time2 = ''
				if (time != '' && time != null) {
					time1 = time[0]
					time2 = time[1]
				}
				let params = {
					StartTime: time1,
					EndTime: time2,
					State: _this.searchForm.state,
					pageIndex: _this.pageIndex,
					pageSize: _this.pageSize
				}
				likeList(params).then(res => {
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
						time: [],
						state: '0'
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
