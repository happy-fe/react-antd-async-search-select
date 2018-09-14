import React, { Component } from "react";
import T from "prop-types";
import { Select, message, Spin } from "antd";
const Option = Select.Option;

export default class AsyncSelect extends Component {
  constructor(props) {
    super(props);
    this.typingTimer = undefined;
    this.state = {
      list: [],
      loading: false
    };
  }
  static propTypes = {
    valueField: T.string.isRequired,
    textField: T.string.isRequired,
    optionTextSetter: T.func,
    onSearchBefore: T.func,
    onSearchAfter: T.func,
    initialOption: T.object,
    reqUrl: T.string.isRequired,
    filterField: T.string.isRequired,
    reqMethod: T.string.isRequired,
    reqHeader: T.object,
    isPage: T.bool,
    allowClear: T.bool,
    filterOption: T.bool,
    clearOptions: T.func,
    spinner: T.object
  };

  static defaultProps = {
    notFoundContent: <span>&nbsp;</span>,
    optionFilterProp: "children",
    showSearch: true,
    showArrow: false,
    filterOption: false,
    placeholder: "请选择",
    isPage: false,
    allowClear: true,
    spinner: <Spin size="small" />
  };

  componentDidMount() {
    const { initialOption } = this.props;

    this.setInitialOption(initialOption);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.initialOption && nextProps.initialOption) {
      this.setInitialOption(nextProps.initialOption);
    }

    const { value: nextValue } = nextProps;

    const { list } = this.state;

    if (!nextValue && list.length) {
      this.clearOptions();
    }
  }

  setInitialOption = initialOption => {
    let { list, initialed } = this.state;

    if (!initialed && initialOption) {
      list = [initialOption];

      this.setState({ list, initialed: true }, () => {
        this.props.onSelect &&
          this.props.onSelect(this.props.value, initialOption);
      });
    }
  };

  onSearchDebounce = keyword => {
    if (!keyword) {
      return;
    }

    if (this.typingTimer && typeof this.typingTimer === "number") {
      clearTimeout(this.typingTimer);
      this.typingTimer = undefined;
    }

    this.typingTimer = setTimeout(this.onSearch.bind(this, keyword), 1000);
  };

  onSearch = keyword => {
    const {
      onSearchBefore,
      reqUrl,
      reqMethod,
      header,
      isPage,
      onSearchAfter,
      filterField,
      ajaxRequest
    } = this.props;
    if (
      !ajaxRequest ||
      Object.prototype.toString.call(ajaxRequest) !== "[object Function]"
    ) {
      throw new Error(
        "miss prop ajaxRequest: which needed for send http request"
      );
    }

    keyword = keyword + "";

    let params = {};

    if (onSearchBefore) {
      params = this.props.onSearchBefore();
    }

    if (keyword.trim()) {
      // 待商议

      params[filterField] = keyword.trim();
    }

    this.setState(
      {
        list: [],
        loading: true
      },
      () => {
        ajaxRequest(reqUrl, { params, method: reqMethod, header }).then(
          result => {
            this.setState({ loading: false });

            if (result.success) {
              let list = [];

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

              this.setState({ list });
            } else {
              this.setState({ loading: false });
              message.error("获取数据失败!");
            }
          },
          err => {
            this.setState({ loading: false });
            message.error("获取数据失败!");
          }
        );
      }
    );
  };

  itemRender = list => {
    const { valueField, textField, optionTextSetter } = this.props;

    return list.map(item => {
      let text = item[textField];
      if (optionTextSetter) {
        text = optionTextSetter({ ...item });
      }
      return (
        <Option key={item[valueField] + ""} value={item[valueField] + ""}>
          {text}
        </Option>
      );
    });
  };

  onChange = value => {
    const { valueField } = this.props;

    const option = this.state.list.find(val => val[valueField] == value) || {};

    this.props.onChange && this.props.onChange(value);

    this.props.onSelect && this.props.onSelect(value, option);
  };

  render() {
    const {
      valueField,
      textField,
      onSearchBefore,
      onSearch,
      onSearchAfter,
      onSelect,
      onChange,
      reqUrl,
      reqDataType,
      reqMethod,
      isPage,
      filterField,
      initialOption,
      notFoundContent,
      spinner,
      ajaxRequest,
      ...others
    } = this.props;

    const { list, loading, key } = this.state;

    if (loading) {
      others.notFoundContent = spinner;
    } else {
      others.notFoundContent = null;
    }

    others.style = others.style || {};

    if (!others.style.textAlign) {
      others.style.textAlign = "left";
    }

    return (
      <Select
        {...others}
        onSearch={this.onSearchDebounce}
        onChange={this.onChange}
      >
        {this.itemRender(list)}
      </Select>
    );
  }

  // api

  clearOptions = () => {
    this.setState({ list: [] });
  };
}
