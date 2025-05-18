export const formatDate = (date: Date | string | number): string => {
	const dateObj = new Date(date)
	const hours = ('0' + dateObj.getHours()).slice(-2)
	const minutes = ('0' + dateObj.getMinutes()).slice(-2)
	const day = ('0' + dateObj.getDate()).slice(-2)
	const month = ('0' + (dateObj.getMonth() + 1)).slice(-2)
	return (
		hours +
		':' +
		minutes +
		' ' +
		day +
		'/' +
		month +
		'/' +
		dateObj.getFullYear()
	)
}
