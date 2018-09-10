"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _antd = require("antd");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Option = _antd.Select.Option;

var AsyncSelect = function (_Component) {
  _inherits(AsyncSelect, _Component);

  function AsyncSelect(props) {
    _classCallCheck(this, AsyncSelect);

    var _this = _possibleConstructorReturn(this, (AsyncSelect.__proto__ || Object.getPrototypeOf(AsyncSelect)).call(this, props));

    _this.setInitialOption = function (initialOption) {
      var _this$state = _this.state,
          list = _this$state.list,
          initialed = _this$state.initialed;


      if (!initialed && initialOption) {
        list = [initialOption];

        _this.setState({ list: list, initialed: true }, function () {
          _this.props.onSelect && _this.props.onSelect(_this.props.value, initialOption);
        });
      }
    };

    _this.onSearchDebounce = function (keyword) {
      if (!keyword) {
        return;
      }

      if (_this.typingTimer && typeof _this.typingTimer === "number") {
        clearTimeout(_this.typingTimer);
        _this.typingTimer = undefined;
      }

      _this.typingTimer = setTimeout(_this.onSearch.bind(_this, keyword), 1000);
    };

    _this.onSearch = function (keyword) {
      var _this$props = _this.props,
          onSearchBefore = _this$props.onSearchBefore,
          reqUrl = _this$props.reqUrl,
          reqMethod = _this$props.reqMethod,
          header = _this$props.header,
          isPage = _this$props.isPage,
          onSearchAfter = _this$props.onSearchAfter,
          filterField = _this$props.filterField,
          ajaxRequest = _this$props.ajaxRequest;

      if (!ajaxRequest || Object.prototype.toString.call(ajaxRequest) !== "[object Function]") {
        throw new Error("miss prop ajaxRequest: which needed for send http request");
      }

      keyword = keyword + "";

      var params = {};

      if (onSearchBefore) {
        params = _this.props.onSearchBefore();
      }

      if (keyword.trim()) {
        // 待商议

        params[filterField] = keyword.trim();
      }

      _this.setState({
        list: [],
        loading: true
      }, function () {
        ajaxRequest(reqUrl, { params: params, method: reqMethod, header: header }).then(function (result) {
          _this.setState({ loading: false });

          if (result.success) {
            var list = [];

            if (onSearchAfter) {
              // 自处理函数
              list = onSearchAfter(result) || [];
            } else {
              // 是否分页
              if (!isPage) {
                list = result.data;
              } else {
                list = result.data.list;
              }
            }

            list = list || [];

            _this.setState({ list: list });
          } else {
            _this.setState({ loading: false });
            _antd.message.error("获取数据失败!");
          }
        }, function (err) {
          _this.setState({ loading: false });
          _antd.message.error("获取数据失败!");
        });
      });
    };

    _this.itemRender = function (list) {
      var _this$props2 = _this.props,
          valueField = _this$props2.valueField,
          textField = _this$props2.textField,
          optionTextSetter = _this$props2.optionTextSetter;


      return list.map(function (item) {
        var text = item[textField];
        if (optionTextSetter) {
          text = optionTextSetter(_extends({}, item));
        }
        return _react2.default.createElement(
          Option,
          { key: item[valueField] + "", value: item[valueField] + "" },
          text
        );
      });
    };

    _this.onChange = function (value) {
      var valueField = _this.props.valueField;


      var option = _this.state.list.find(function (val) {
        return val[valueField] == value;
      }) || {};

      _this.props.onChange && _this.props.onChange(value);

      _this.props.onSelect && _this.props.onSelect(value, option);
    };

    _this.clearOptions = function () {
      _this.setState({ list: [] });
    };

    _this.typingTimer = undefined;
    _this.state = {
      list: [],
      loading: false
    };
    return _this;
  }

  _createClass(AsyncSelect, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var initialOption = this.props.initialOption;


      this.setInitialOption(initialOption);
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (!this.props.initialOption && nextProps.initialOption) {
        this.setInitialOption(nextProps.initialOption);
      }

      var nextValue = nextProps.value;
      var list = this.state.list;


      if (!nextValue && list.length) {
        this.clearOptions();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          valueField = _props.valueField,
          textField = _props.textField,
          onSearchBefore = _props.onSearchBefore,
          onSearch = _props.onSearch,
          onSearchAfter = _props.onSearchAfter,
          onSelect = _props.onSelect,
          onChange = _props.onChange,
          reqUrl = _props.reqUrl,
          reqDataType = _props.reqDataType,
          reqMethod = _props.reqMethod,
          isPage = _props.isPage,
          filterField = _props.filterField,
          initialOption = _props.initialOption,
          notFoundContent = _props.notFoundContent,
          spinner = _props.spinner,
          ajaxRequest = _props.ajaxRequest,
          others = _objectWithoutProperties(_props, ["valueField", "textField", "onSearchBefore", "onSearch", "onSearchAfter", "onSelect", "onChange", "reqUrl", "reqDataType", "reqMethod", "isPage", "filterField", "initialOption", "notFoundContent", "spinner", "ajaxRequest"]);

      var _state = this.state,
          list = _state.list,
          loading = _state.loading,
          key = _state.key;


      if (loading) {
        others.notFoundContent = spinner;
      } else {
        others.notFoundContent = _react2.default.createElement(
          "span",
          null,
          "\xA0"
        );
      }

      others.style = others.style || {};

      if (!others.style.textAlign) {
        others.style.textAlign = "left";
      }

      return _react2.default.createElement(
        _antd.Select,
        _extends({}, others, {
          onSearch: this.onSearchDebounce,
          onChange: this.onChange
        }),
        this.itemRender(list)
      );
    }

    // api

  }]);

  return AsyncSelect;
}(_react.Component);

AsyncSelect.propTypes = {
  valueField: _propTypes2.default.string.isRequired,
  textField: _propTypes2.default.string.isRequired,
  optionTextSetter: _propTypes2.default.func,
  onSearchBefore: _propTypes2.default.func,
  onSearchAfter: _propTypes2.default.func,
  initialOption: _propTypes2.default.object,
  reqUrl: _propTypes2.default.string.isRequired,
  filterField: _propTypes2.default.string.isRequired,
  reqMethod: _propTypes2.default.string.isRequired,
  reqHeader: _propTypes2.default.object,
  isPage: _propTypes2.default.bool,
  allowClear: _propTypes2.default.bool,
  filterOption: _propTypes2.default.bool,
  clearOptions: _propTypes2.default.func,
  spinner: _propTypes2.default.object
};
AsyncSelect.defaultProps = {
  notFoundContent: _react2.default.createElement(
    "span",
    null,
    "\xA0"
  ),
  optionFilterProp: "children",
  showSearch: true,
  showArrow: false,
  filterOption: false,
  placeholder: "请选择",
  isPage: false,
  allowClear: true,
  spinner: _react2.default.createElement(_antd.Icon, { type: "loading" })
};
exports.default = AsyncSelect;
module.exports = exports["default"];