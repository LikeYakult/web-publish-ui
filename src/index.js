import HelloWorld from "./components/hello-world";

const components = {
    HelloWorld
};

const install = (vue) => {
    Object.keys(components).forEach((key) => {
        vue.component(key, components[key]);
    });
}

export default {
    ...components,
    install
}
