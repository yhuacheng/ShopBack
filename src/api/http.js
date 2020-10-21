import axios from 'axios';
import router from '../routes';
import qs from 'qs';

import {
	Message
} from 'element-ui';

axios.defaults.timeout = 60000
axios.defaults.baseURL = ''

//post请求的默认请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// request请求拦截器
axios.interceptors.request.use(
	config => {
		// 如果有token则在请求时携带token
		if (sessionStorage.getItem('token')) {
			config.headers.common["token"] = sessionStorage.getItem('token');
		}
		return config;
	},
	error => {
		return Promise.reject(error);
	});

// response响应拦截器
axios.interceptors.response.use(
	response => {
		let data = response.data
		if (data.IsSuccess) {
			if (data.Message) {
				Message.success(data.Message) //如果有成功提示信息，则展示成功提示信息
			}
			return Promise.resolve(response)
		} else {
			if (data.Message) {
				Message.error(data.Message) //如果有错误提示信息，则展示错误提示信息
			}
			return Promise.reject(response)
		}
	},
	error => {
		Message.error('请求出现错误，错误码：' + error.response.status) //展示错误信息
		return Promise.reject(error)
	}
)

/** 
 * get方法封装，对应get请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function get(url, params) {
	return new Promise((resolve, reject) => {
		axios.get(url, {
				params: params
			})
			.then(res => {
				resolve(res.data);
			})
			.catch(err => {
				reject(err.data)
			})
	});
}

/** 
 * post方法封装，对应post请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function post(url, params) {
	return new Promise((resolve, reject) => {
		axios.post(url, qs.stringify(params))
			.then(res => {
				resolve(res.data);
			})
			.catch(err => {
				reject(err.data)
			})
	});
}

/** 
 * post方法封装，对应postForm请求，用于需要上传文件的接口，请求头为 multipart/form-data
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的formData形式参数]
 */
export function postForm(url, params) {
	return new Promise((resolve, reject) => {
		let config = {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}
		axios.post(url, params, config)
			.then(res => {
				resolve(res.data);
			})
			.catch(err => {
				reject(err.data)
			})
	});
}
