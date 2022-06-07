var locations = [];
var places = [];
var map;
var service;
var flag = 0;
var area_num = 7;
var travel_mode = 'walk';
var weight = 'length';
var highway = false;
var how = 'start';

function changeTravelMode(mode) {
    travel_mode = mode;
}

function changeWeight(value) {
    weight = value;
}

function changeHighway(value) {
    if(value == 'false') {
        highway = false;
    } else {
        highway = true;
    }
}

function changeHow(value) {
    if (value == 'start') {
        if (document.getElementById('startPoint').classList.contains('noDisplay')) {
            document.getElementById('startPoint').classList.remove('noDisplay');
        }
        if (!(document.getElementById('endPoint').classList.contains('noDisplay'))) {
            document.getElementById('endPoint').classList.add('noDisplay');
        }
        how = 'start'
        } else if (value == 'startend') {
        if (document.getElementById('startPoint').classList.contains('noDisplay')) {
            document.getElementById('startPoint').classList.remove('noDisplay')
        }
        if (document.getElementById('endPoint').classList.contains('noDisplay')) {
            document.getElementById('endPoint').classList.remove('noDisplay');
        }
        how = 'startend'
    } else {
        if (!(document.getElementById('startPoint').classList.contains('noDisplay'))) {
            document.getElementById('startPoint').classList.add('noDisplay');
        }
        if (!(document.getElementById('endPoint').classList.contains('noDisplay'))) {
            document.getElementById('endPoint').classList.add('noDisplay');
        }
        how = 'free'
    }
}

// build request
function make() {
    service = new google.maps.DistanceMatrixService();
    locations = [];
    places = [];
    flag = 0;
    if (document.getElementById('inner_output')) {
        var child = document.getElementById('inner_output');
        child.remove();
    }
    document.getElementById('output_length').innerHTML = '計算中...';
    document.getElementById('output_time').innerHTML = '';

    var points = document.getElementsByClassName('waypoint');
    var waypoints = []
    for(let i=0;i<points.length;i++) {
        if(points[i].value != '') {
            waypoints.push(points[i].value);
        }
    }
    if (how == 'start') {
        var start = document.getElementById('startText').value;
        places = [start].concat(waypoints);
    } else if (how == 'startend') {
        var start = document.getElementById('startText').value;
        var end = document.getElementById('endText').value;
        places = [start].concat(waypoints);
        places.push(end);
    } else {
        places = waypoints;
    }
    var table = new Array(places.length);
    for(let i=0;i<places.length;i++) {
        table[i] = new Array(places.length).fill(0);
    }
    if(travel_mode == 'walk') {
        for(let i=0;i<places.length-1;i++) {
            setTimeout(do_walk_route, i*800, places[i], places.slice(i+1));
        }
    } else if(travel_mode == 'car') {
        var departuretime = '';
        if(document.getElementById('current').checked) {
            departuretime = new Date();
        }
        if(document.getElementById('specify').checked) {
            var nowTime = new Date();
            var hour = document.getElementById('hour').value;
            var minutes = document.getElementById('minutes').value;
            departuretime = new Date(nowTime.getFullYear, nowTime.getMonth, nowTime.getDate, hour, minutes);
        }
        for(let i=0;i<places.length-1;i++) {
            setTimeout(do_car_route, i*800, places[i], places.slice(i+1), departuretime, highway);
        }
    }
    setTimeout(function() {
        if (flag == 1) {
            //表に代入
            var sflag = 0;
            for(let i=0;i<locations.length;i++) {
                var row = places.indexOf(locations[i][0]);
                for(let j=0;j<locations[i][1].length;j++) {
                    var column = places.indexOf(locations[i][1][j]);
                    if (locations[i][2].rows[0].elements[j].status != 'OK') {
                        sflag = locations[i][1][j];
                        break;
                    }
                    if (row < column) {
                        if(weight == 'length') {
                            table[row][column] = locations[i][2].rows[0].elements[j].distance.value;
                        } else {
                            table[row][column] = locations[i][2].rows[0].elements[j].duration.value;
                        }
                    } else {
                        if(weight == 'length') {
                            table[column][row] = locations[i][2].rows[0].elements[j].distance.value;
                        } else {
                            table[row][column] = locations[i][2].rows[0].elements[j].duration.value;
                            }
                    }
                }
                if (sflag != 0) {
                    break;
                }
            }
            if (sflag != 0) {
                document.getElementById('output_length').innerHTML = sflag + 'が見つかりませんでした。住所を入力してください';
                return;
            }
            //計算開始
            var minimum = Infinity;
            var short_route = '';
            if (how == 'start') {
                for (list of Permutation(places.slice(1), places.length-1)) {
                    let sum = calculation(table, list, start, '', minimum);
                    if (sum == -1) {
                        continue;
                    }
                    if (sum < minimum) {
                        minimum = sum;
                        minimum_route = [start].concat(list).join('/');
                    }
                };
                var returnedValue = [minimum, minimum_route];
            } else if (how == 'startend') {
                for (list of Permutation(places.slice(1, -1), places.length-2)) {
                    let sum = calculation(table, list, start, end, minimum);
                    if (sum == -1) {
                        continue;
                    }
                    if (sum < minimum) {
                        minimum = sum;
                        let temp = [start].concat(list)
                        minimum_route = temp.push(end).join('/');
                    }
                };
                var returnedValue = [minimum, minimum_route];
            } else {
                for (list of Permutation(places, places.length)) {
                    var sum = calculation(table, list, '', '', minimum);
                    if (sum == -1) {
                        continue;
                    }
                    if (sum < minimum) {
                        minimum = sum;
                        minimum_route = list.join('/');
                    }
                };
                var returnedValue = [minimum, minimum_route];
            }
            //計算終了
            var splited_route = returnedValue[1].split('/');
            var parent = document.getElementById('output');
            var innerOutput = document.createElement('p');
            innerOutput.id = 'inner_output'
            innerOutput.innerHTML = '';
            var other = 0;
            for(var i=0;i<splited_route.length;i++) {
                innerOutput.innerHTML += splited_route[i];
                if (i < splited_route.length-1) {
                    var arrow = document.createElement('a');
                    arrow.innerHTML = '→';
                    if (travel_mode == 'walk') {
                      arrow.href = 'https://www.google.com/maps/dir/?api=1&origin=' + splited_route[i] + '&destination=' + splited_route[i+1] + '&travelmode=walking';
                    } else {
                        arrow.href = 'https://www.google.com/maps/dir/?api=1&origin=' + splited_route[i] + '&destination=' + splited_route[i+1] + '&travelmode=driving';
                    }
                    arrow.target = '_blank';
                    innerOutput.appendChild(arrow);

                    start_num = places.indexOf(splited_route[i]);
                    end_num = places.indexOf(splited_route[i+1]);
                    if(start_num < end_num) {
                        var keyNum1 = start_num;
                        var keyNum2 = locations[keyNum1][1].indexOf(splited_route[i+1]);
                    } else {
                        var keyNum1 = end_num;
                        var keyNum2 = locations[keyNum1][1].indexOf(splited_route[i]);
                    }
                    if (weight == 'length') {
                        other += locations[keyNum1][2].rows[0].elements[keyNum2].duration.value;
                    } else {
                        other += locations[keyNum1][2].rows[0].elements[keyNum2].distance.value;
                    }
                }
            }
            parent.appendChild(innerOutput);
            if (weight == 'length') {
                document.getElementById('output_length').innerHTML = '総移動距離：' + (returnedValue[0]  / 1000).toString() + 'km';
                var calculatedMinutes = Math.floor(other / 60);
                if (calculatedMinutes >= 60) {
                    var calculatedHour = Math.floor(calculatedMinutes / 60);
                    var calculatedMinutes = calculatedMinutes % 60;
                    document.getElementById('output_time').innerHTML = '総移動時間：' + calculatedHour.toString() + '時間' + calculatedMinutes.toString() + '分';
                } else {
                    document.getElementById('output_time').innerHTML = '総移動時間：' + calculatedMinutes.toString() + '分';
                }
            } else {
                document.getElementById('output_length').innerHTML = '総移動距離：' + (other  / 1000).toString() + 'km';
                var calculatedMinutes = Math.floor(returnedValue[0] / 60);
                if (calculatedMinutes >= 60) {
                    var calculatedHour = Math.floor(calculatedMinutes / 60);
                    var calculatedMinutes = calculatedMinutes % 60;
                    document.getElementById('output_time').innerHTML = '総移動時間：' + calculatedHour.toString() + '時間' + calculatedMinutes.toString() + '分';
                } else {
                    document.getElementById('output_time').innerHTML = '相違同意時間：' + calculatedMinutes.toString() + '分';
                }
            }

        } else {
            setTimeout(arguments.callee, 800);
        }
    }, 800);
}

function do_walk_route(origin, destination) {
    const request = {
        origins: [origin],
        destinations: destination,
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC
    };
    service.getDistanceMatrix(request).then((response) => {
        var result = JSON.parse(JSON.stringify(response, null, 2));
        locations.push([origin, destination, response]);
        if(locations.length == places.length-1) {
            flag = 1;
        }
    });
}

function do_car_route(origin, destination, departuretime, highway) {
    if(departuretime == '') {
        var request = {
            origins: [origin],
            destinations: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: highway,
            avoidTolls: highway
        };
    } else {
        var request = {
            origins: [origin],
            destinations: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            drivingOptions: {
                departureTime: departuretime,
                trafficModel: 'bestguess'
            },
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: highway,
            avoidTolls: highway
        };
    }
    service.getDistanceMatrix(request).then((response) => {
        var result = JSON.parse(JSON.stringify(response, null, 2));
        locations.push([origin, destination, response]);
        if(locations.length == places.length-1) {
            flag = 1;
        }
    });
}

function* Permutation(input_list, num) {
    yield* (function* gfn(result, list) {
        if (result.length < num) {
            for(let i=0;i<list.length;i++) {
                let tlist = list.slice(0);
                tlist.splice(i, 1);
                yield* gfn(result.concat(list[i]), tlist);
            }
        } else {
            yield result;
        }
    })([], input_list);
};

function calculation(table, permutationList, Start, End, minimum) {
    var sum = 0;
    if (Start == '') {
        sum = 0;
        for(let j=0;j<permutationList.length-1;j++) {
            var start_num = places.indexOf(permutationList[j]);
            var end_num = places.indexOf(permutationList[j+1]);
            if (start_num < end_num) {
                sum += table[start_num][end_num];
            } else {
                sum += table[end_num][start_num];
            }
            if (sum > minimum) {
                sum = -1;
                break;
            }
        }
    } else if (End == '') {
        sum = 0;
        var route = [Start].concat(permutationList);
        for(let j=0;j<route.length-1;j++) {
            var start_num = places.indexOf(route[j]);
            var end_num = places.indexOf(route[j+1]);
            if (start_num < end_num) {
                sum += table[start_num][end_num];
            } else {
                sum += table[end_num][start_num];
            }
            if (sum > minimum) {
                sum = -1;
                break;
            }
        }
    } else {
        sum = 0;
        var route = [Start].concat(permutationList);
        route.push(End);
        for(let j=0;j<route.length-1;j++) {
            var start_num = places.indexOf(route[j]);
            var end_num = places.indexOf(route[j+1]);
            if (start_num < end_num) {
                sum += table[start_num][end_num];
            } else {
                sum += table[end_num][start_num];
            }
            if (sum > minimum) {
                sum = -1;
                break;
            }
        }
    }
    return sum;
}

function plusArea() {
    if (area_num > 20) {
        window.alert('これ以上追加できません。')
        return;
    }
    var inner_element = document.createElement('div');
    inner_element.className = "inner_element";
    inner_element.id = "area" + area_num;
    area_num++;
    var cspann = document.createElement('span');
    cspann.innerHTML = '場所の名前: ';
    var cspan = document.createElement('span');
    var cbtn = document.createElement('input');
    cbtn.type = 'text';
    cbtn.id = '';
    cbtn.className = 'waypoint';

    var parent = document.getElementById('inputElement');
    inner_element.appendChild(cspann);
    cspan.appendChild(cbtn);
    inner_element.appendChild(cspan);
     parent.appendChild(inner_element);
}

function deleteArea() {
    if (area_num < 4) {
        window.alert('これ以上削除できません。')
        return;
    }
    var child = document.getElementById('area' + (area_num-1));
    child.remove();
    area_num--;
}