import moment from 'moment';

export function formatDateTime(str) {
    return moment(str).format('YYYY-MM-DD H:mm:ss');
}

export function formatScore(val) {
    return (Math.ceil(val*100*100)/100).toString().replace(".", ",")+"%";
}

export function resolveUserNames(ids, users) {
    if (typeof(ids)==='array') {
        var result = [];
        for (var key in ids) {
            var user = users[ids[key]];
            result.push(user.firstname+" "+user.surname);
        }
        return result;
    } else {
        var user = users[ids];
        return user.firstname+" "+user.surname;
    }
}
