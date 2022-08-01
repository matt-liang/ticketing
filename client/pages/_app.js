import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async appContext => {

    const renderReq = buildClient(appContext.ctx);
    const res = await renderReq('/api/users/currentuser');
    const data = await res.json();

    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, renderReq, data.currentUser);
    }

    return {
        pageProps,
        ...data
    };
};

export default AppComponent;