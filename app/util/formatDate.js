export default formatDate = {
    formatTimeStmp (seconds) {
        if(seconds){
            var d = new Date(seconds);
            var month = d.getMonth()+1;
            var date = d.getDate();
            var day = d.getFullYear()+"-"+month+"-"+date;
            var nowDate = new Date();
            var nowDay = nowDate.getFullYear()+"-"+(nowDate.getMonth()+1)+"-"+nowDate.getDate();
            if(day==nowDay){
                day="今天";
                var h=d.getHours();
                var m= d.getMinutes();
                var s= d.getSeconds();
                if(h<10){
                    h="0"+h;
                }
                if(m<10){
                    m="0"+m;
                }
                if(s<10){
                    s="0"+s;
                }
                day = day + "  " + h + ":" + m + ":" + s;
            }else{
                if(month < 10){
                    month = '0'+month;
                }

                if(date < 10){
                    date = '0'+date;
                }
                day = d.getFullYear()+"-"+month+"-"+date;
            }
        }
        return day;
    },
    formatTimeStmpToFullTime(seconds) {
        if(seconds) {
            var d = new Date(seconds);
            var month = d.getMonth() + 1;
            var date = d.getDate();
            var day = d.getFullYear() + "-" + month + "-" + date;
            var nowDate = new Date();
            var nowDay = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + "-" + nowDate.getDate();
            var h = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();
            if (h < 10) {
                h = "0" + h;
            }
            if (m < 10) {
                m = "0" + m;
            }
            if (s < 10) {
                s = "0" + s;
            }
            if (day == nowDay) {
                day = "今天";
                day = h + ":" + m;
            } else {
                if (month < 10) {
                    month = '0' + month;
                }

                if (date < 10) {
                    date = '0' + date;
                }
                day = d.getFullYear() + "-" + month + "-" + date+ "  " + h + ":" + m;
            }
            return day;
        }
    }
}