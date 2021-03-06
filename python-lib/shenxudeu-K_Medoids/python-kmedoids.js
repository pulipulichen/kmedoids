PythonKMedoids = function (_matrix, _k, _max_iteration) {
    var _do_normalization = true;

    if (typeof (_max_iteration) === "undefined") {
        _max_iteration = 150;
    }


    //console.log(_matrix);


    // --------
    // 處理缺漏值
    var _col_median = {};
    for (var _row_i in _matrix) {
        for (var _col_i in _matrix[_row_i]) {
            var _cell = _matrix[_row_i][_col_i];
            if (isNaN(_cell) === true) {
                continue;
            }

            if (typeof (_col_median[_col_i]) === "undefined") {
                _col_median[_col_i] = [];
            }
            _col_median[_col_i].push(_cell);
        }
    }

    // 轉換為中位數
    var _calc_median = function (values) {

        values.sort(function (a, b) {
            return a - b;
        });

        var half = Math.floor(values.length / 2);

        if (values.length % 2)
            return values[half];
        else
            return (values[half - 1] + values[half]) / 2.0;
    };

    for (var _col_i in _col_median) {
        _col_median[_col_i] = _calc_median(_col_median[_col_i]);
    }

    for (var _row_i in _matrix) {
        for (var _col_i in _matrix[_row_i]) {
            var _cell = _matrix[_row_i][_col_i];
            
            if (isNaN(_cell) === true || typeof(_cell) !== "number") {
                
                _matrix[_row_i][_col_i] = _col_median[_col_i];
            }
        }
    }


    //console.log(_matrix);



    // 正規化
    if (_do_normalization) {
        var _attr_max = {};
        var _attr_min = {};
        for (var _row_i in _matrix) {
            for (var _col_i in _matrix[_row_i]) {
                var _cell = _matrix[_row_i][_col_i];

                if (typeof (_attr_max[_col_i]) === "undefined") {
                    _attr_max[_col_i] = _cell;
                    _attr_min[_col_i] = _cell;
                } else {
                    _attr_max[_col_i] = Math.max(_cell, _attr_max[_col_i]);
                    _attr_min[_col_i] = Math.min(_cell, _attr_min[_col_i]);
                }
            }
        }

        for (var _row_i in _matrix) {
            for (var _col_i in _matrix[_row_i]) {
                var _cell = _matrix[_row_i][_col_i];
                var _norm_cell = (_cell - _attr_min[_col_i]) / (_attr_max[_col_i] - _attr_min[_col_i]);
                _matrix[_row_i][_col_i] = _norm_cell;
            }
        }
    }

    //console.log(_matrix);

    // -----------------------

    var _data = {
        matrix: _matrix,
        k: _k,
        max_iter: _max_iteration
    };

    //console.log(JSON.stringify(_matrix));

    // --------------------

    var _result = false;
    var _done = false;

    var _exec = function () {

        var pyshell = new PythonShell('./python-lib/shenxudeu-K_Medoids/python-kmedoids.py', {mode: "json"});

        //console.log(_data);
        pyshell.send(_data);

        pyshell.on('message', function (message) {
            _result = message;
            //console.log(message);
        });

        // end the input stream and allow the process to exit
        pyshell.end(function (err) {
            if (err) {
                //throw err;
                _result = err;
            }
            ;

            //console.log('finished');
            _done = true;
        });
    };

    _exec();

    var deasync = require('deasync');
    deasync.loopWhile(function () {
        return !_done;
    });

    // ------------------------
    // 後置處理

    //console.log(_result);
    //return _result;

    var _array_avg = function (_array) {
        var _sum = 0;
        for (var _i in _array) {
            _sum += _array[_i];
        }
        return _sum / _array.length;
    };

    var _uniq = function (a) {
        var b = JSON.parse(JSON.stringify(a));
        try {
            return b.sort().filter(function (item, pos, ary) {
                return !pos || item !== ary[pos - 1];
            });
        } catch (e) {
            console.log(a);
        }
    };

    // 先取出中心點列表
    var _result_medoids = _uniq(_result);
    var _medoids_list = [];
    //var _medoids_key = [];
    for (var _i in _result_medoids) {
        var _m = _result_medoids[_i];
        var _m_array = _matrix[parseInt(_m, 10)];
        var _m_avg = _array_avg(_m_array);
        //_medoids_key.push(Math.round(_m_avg*100)/100);
        _medoids_list.push({
            m: _m,
            avg: _m_avg
        });
        //console.log(_m_array);
    }

    var _sorted = _medoids_list.slice().sort(function (a, b) {
        return a.avg - b.avg
    });
    var _ranks = _medoids_list.slice().map(function (v) {
        return _sorted.indexOf(v) + 1;
    });

    var _medoids_dict = {};
    for (var _i = 0; _i < _medoids_list.length; _i++) {
        var _rank = _ranks[_i];
        var _m = _medoids_list[_i].m + "";
        _medoids_dict[_m] = _rank - 1;
    }

    for (var _i in _result) {

        var _label = _medoids_dict[_result[_i] + ""];
        //console.log([_label, _result[_i]]);
        _result[_i] = _label;
    }

    //console.log(_result);

    return _result;
};