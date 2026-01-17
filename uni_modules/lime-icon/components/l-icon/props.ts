// @ts-nocheck
export const ariaProps = {
	ariaHidden: Boolean,
	ariaRole: String,
	ariaLabel: String,
	ariaLabelledby: String,
	ariaDescribedby: String,
	ariaBusy: Boolean,
	// lStyle: String
}

export default {
	...ariaProps,
	name: {
		type: String,
		default: ''
		// required: true
	},
	color: {
		type: String
	},
	size: {
		type: [String, Number]
	},
	prefix: {
		type: String,
		default: 'l'
	},
	inherit: {
		type: Boolean,
		default: true
	},
	web: {
		type: Boolean,
		default: false
	},
	lClass: {
		type: String,
		default: ''
	},
	lStyle: {
		type: [String, Object, Array],
		default: ''
	}
}