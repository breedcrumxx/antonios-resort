// new types
interface ImageUrl {
	id: string,
	imageurl: string,
}

type CalculationType = {
	packageprice: number,
	subtotal: number,
	downpaymentpercentage: number,
	discountamount: number,
	discountpercentage: number,
	total: number,
	vat: number,
}

type UserBookingDataTable = {
	id: string;
	bookingid: string,
	client: {
		id: string,
		firstname: string,
		lastname: string,
	},
	checkout: Date;
	checkin: Date;
	status: string;
	package: string,
	total: number,
}

type PackageSchedule = {
	slot: "day" | "night"
	enable: boolean
	check_in: string
	duration: string
	price: number
} | {
	slot: "regular"
	enable: boolean
	check_in: string
	check_out: string
	price: number
}

type GithubLabel = {
	id: number,
	node_id: string,
	url: string,
	name: string,
	color: string,
	default: boolean,
	description: string,
}

type errorModeType = {
	title: string,
	description: string,
	showHome: boolean,
	showClose: boolean,
	closable: boolean
} | null

type ModalError = {
	title: string,
	description: string
}

type FilterDateObject = {
	get: {
		start: Date,
		end: Date,
	},
	compare: {
		start: Date,
		end: Date,
	},
}

// TABLE TYPES
type BookingDataTable = {
	id: string;
	bookingid: string,
	client: {
		id: string,
		firstname: string,
		lastname: string,
	},
	checkout: Date;
	checkin: Date;
	status: string;
	package: {
		id: string,
		packagename: string,
	},
}

type SystemNotification = {
	id: string,
	notification: string,
	read: boolean,
	date: Date
}

interface PendingChange {
	startdate: Date;
	enddate: Date;
	continues: boolean;
}

interface Availability {
	date: Date;
	status: "Full" | "Partial";
	open?: string; // The time frame available, formatted as a string
}

type DateData = {
	continues: boolean;
	startdate: Date;
	enddate: Date;
	bookingid: string;
	custompackage: {
		basepackage: {
			basetype: {
				timein: string;
				duration: number;
			};
		};
	};
}

type UserSession = {
	id: string
	name: string
	email: string
	verified: boolean
	block?: Date
	role: Role
	image: string
}

type PaymentQR = {
	id: number,
	gcashnumber: string,
	accountname: string,
	image: string | File,
}

type Calculation = {
	packageprice: number,
	servicestotal: number,
	less: number,
	total: number,
	vat: number,
}

type PackageRateType = {
	experience: number,
	facility: number,
	cleanliness: number,
	service: number,
	personalfeedback: string,
}

type RateErrorType = {
	experience: boolean,
	facility: boolean,
	cleanliness: boolean,
	service: boolean,
	personalfeedback: boolean,
}

type DiscussionTopics = {
	id: number,
	label: string,
	type: string,
	dialog: (bookingid: string) => string
}

type ExtendClasses = {
	headstyle?: string;
	cellstyle?: string;
	alias?: string;
};

type Role = {
	id: string,
	role: string,
	systemcontrol: boolean,
	businesscontrol: boolean,
	websitecontrol: boolean,
	utilityaccess: boolean,
	websiteaccess: boolean,
}

type ModifiedDateType = ({
	id: string;
	status: string;
	datein: Date;
	dateout: Date;
	time: string;
}[] | {
	status: string;
	datein: Date;
	dateout: Date;
	time: string;
	isMybooking: boolean;
} | {
	status: string;
	datein: Date;
	dateout: Date;
	time: string;
	isMybooking: boolean;
}[])[]
