import { Component } from 'react';
import { ModalInfo } from '../../Modal';
import Aux from '../Auxx';

const withErrorHandler = (WrappedComponent, axios) => {
  return class extends Component {
    state = {
      error: null,
      showModal: false
    }

    componentWillMount () {
      this.reqInterceptor = axios.interceptors.request.use(req => {
        this.setState({error: null, showModal: false});
        return req;
      });
      this.resInterceptor = axios.interceptors.response.use(res => res, error => {
        this.setState({error: error, showModal: true});
      });
    };

    componentWillUnmount() {
      axios.interceptors.request.eject(this.reqInterceptor);
      axios.interceptors.response.eject(this.resInterceptor);
    }

    render () {
      return (
        <Aux>
          <ModalInfo 
            showModal={this.state.showModal} 
            setShowModal={() => this.setState({showModal: !this.state.showModal})}
            title="Oops"
            content={this.state.error ? this.state.error.message : null}
            img="https://cdn.dribbble.com/userupload/21148888/file/original-6bad51f87ee3532bc3cfaeef7921c674.png?resize=752x564&vertical=center"/>
          <WrappedComponent {...this.props} />
        </Aux>
      );
    }
  }
};

export default withErrorHandler;