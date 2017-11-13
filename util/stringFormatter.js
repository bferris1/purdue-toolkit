module.exports = {
	watchSuccess:function (watch) {
		if (!watch)
			return 'Unable to parse watch.';
		return `You will be notified when there is space available in <strong>${watch.courseNumber}: ${watch.courseTitle}, Section ${watch.sectionNumber}</strong>`;
	}
};