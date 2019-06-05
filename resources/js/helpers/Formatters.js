import moment from 'moment';

export function formatDateTime(str) {
    return moment(str).format('YYYY-MM-DD H:mm:ss');
}
