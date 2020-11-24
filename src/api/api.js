import {
	get,
	post,
	postForm
} from './http'

export const login = (params) => post('/api/BackUser/Login', params) //登录

export const menuOfUser = (params) => get('/api/BackUser/GetBackUserNavigationBar', params) //菜单目录树(用户权限目录)

export const menuList = (params) => get('/api/BackNavigationBar/GetNavigationBarList', params) //菜单目录树(全部目录)

export const productList = (params) => get('/api/ProductManage/GetProductManageList', params) //商品列表
export const productAdd = (params) => postForm('/api/ProductManage/Add', params) //商品新增
export const productEdit = (params) => postForm('/api/ProductManage/UpdateProductManage', params) //商品修改
export const productState = (params) => post('/api/ProductManage/Upanddown', params) //商品上架下架
export const productDelete = (params) => post('/api/ProductManage/DeleteProductManage', params) //商品删除

export const discountsType = (params) => get('/api/DiscountsType/GetModelList', params) //折扣类别

export const userList = (params) => get('/api/BackUser/GetBackUserList', params) //用户列表
export const userAdd = (params) => post('/api/BackUser/AddBackUser', params) //用户新增
export const userEdit = (params) => post('/api/BackUser/UpdateBackUser', params) //用户修改
export const userEditPassword = (params) => post('/api/BackUser/UpdatePassword', params) //用户密码修改
export const userBindRole = (params) => post('/api/BackUser/AddBackUserByRole', params) //用户绑定角色
export const userCheckedRole = (params) => get('/api/BackUser/GetBackUserIdByRoleId', params) //查看已勾选选角色

export const roleList = (params) => get('/api/Role/GetRoleList', params) //角色列表
export const roleAdd = (params) => post('/api/Role/AddRole', params) //角色新增
export const roleEdit = (params) => post('/api/Role/UpdateRole', params) //角色修改
export const roleBindMenu = (params) => post('/api/BackUser/AddRoleNavigationBar', params) //角色绑定菜单
export const roleCheckedMenu = (params) => get('/api/BackUser/GetRoleIdByNavigationBarId', params) //查看角色已勾选菜单

export const countryList = (params) => get('/api/Country/GetCountryList', params) //国家列表
export const countryAdd = (params) => post('/api/Country/AddCountry', params) //国家新增
export const countryEdit = (params) => post('/api/Country/UpdateCountry', params) //国家修改

export const typeList = (params) => get('/api/ProductType/GetProductTypeList', params) //商品分类列表
export const typeAdd = (params) => post('/api/ProductType/AddProductType', params) //商品分类新增
export const typeEdit = (params) => post('/api/ProductType/UpdateProductType', params) //商品分类修改

export const levelScoreList = (params) => get('/api/ProductGrade/GetProductGradeList', params) //商品等级分数列表
export const levelScoreAdd = (params) => post('/api/ProductGrade/AddProductGrade', params) //商品等级分数新增
export const levelScoreEdit = (params) => post('/api/ProductGrade/UpdateProductGrade', params) //商品等级分数修改

export const bannerList = (params) => get('/api/Rotation/GetRotationList', params) //轮播图列表
export const bannerAdd = (params) => postForm('/api/Rotation/Add', params) //轮播图新增
export const bannerEdit = (params) => postForm('/api/Rotation/UpdateRotation', params) //轮播图修改

export const contactList = (params) => get('/api/CustomerService/GetCustomerService', params) //联系方式列表
export const contactAdd = (params) => post('/api/CustomerService/AddCustomerService', params) //联系方式新增
export const contactEdit = (params) => post('/api/CustomerService/UpdateCustomerService', params) //联系方式修改

export const noticeList = (params) => get('/api/Notice/GetNotice', params) //系统公告列表
export const noticeAdd = (params) => post('/api/Notice/AddNotice', params) //系统公告新增
export const noticeEdit = (params) => post('/api/Notice/UpdateNotice', params) //系统公告修改

export const buyerList = (params) => get('/api/Buyer/GetBuyerList', params) //买家列表
export const buyerEdit = (params) => post('/api/Buyer/UpdateBuyer', params) //买家修改

export const orderList = (params) => get('/api/Order/GetOrderList', params) //订单列表
export const orderCheckBuy = (params) => post('/api/Order/ConfirmationAudit', params) //订单审核购买
export const orderCheckReview = (params) => postForm('/api/Order/ConfirmationWrite', params) //订单审核评价
