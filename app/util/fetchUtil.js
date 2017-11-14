export default FetchUtil = {
    netUtil(url, data, type, callback){
        if(type == 'POST'){
            let postOptions = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body:JSON.stringify(data)
                // body:data
            };
            fetch(url, postOptions).then((response) => {
                console.log(response);
                return response.json()
            }).then((responseText) => {
                    //  callback(JSON.parse(responseText));
                    callback(responseText);
                }).done();
        }else{
            let getOptions = {
              methd:'GET',
            };
            fetch(url,getOptions).then((response) => {
                return response.json()
            }).then((responseText) => {
                    callback(responseText);
                });
        }

    }
}