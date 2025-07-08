# env-flag

A lightweight, customizable environment flag indicator for browser applications. Shows DEV/PROD/STAGING/TEST status as a badge in your app. Perfect for distinguishing environments at a glance!

## 🚀 Features
- **Automatic environment detection** (development, production, staging, test)
- **Customizable colors, text, position, and size**
- **Accessible** (keyboard, screen reader, ARIA labels)
- **TypeScript support**
- **No dependencies**

## 📦 Installation

```sh
npm install env-flag
```

or

```sh
yarn add env-flag
```

## 🛠️ Usage

### Basic
```js
import EnvFlag from 'env-flag';

const flag = new EnvFlag();
flag.init();
```

### With Custom Options
```js
import EnvFlag from 'env-flag';

const flag = new EnvFlag({
  position: 'top-left',
  size: 'large',
  productionColor: '#27ae60',
  developmentText: 'DEVS',
  debug: true
});
flag.init();
```

### Force Environment (for testing)
```js
const flag = new EnvFlag({
  forceEnv: 'staging',
  stagingColor: '#ff9800',
  stagingText: 'STAGING'
});
flag.init();
```

## ⚙️ Configuration

| Option             | Type     | Default         | Description                                  |
|--------------------|----------|-----------------|----------------------------------------------|
| productionColor    | string   | `#e74c3c`       | Prod badge color                             |
| developmentColor   | string   | `#3498db`       | Dev badge color                              |
| stagingColor       | string   | `#f39c12`       | Staging badge color                          |
| testColor          | string   | `#9b59b6`       | Test badge color                             |
| productionText     | string   | `PROD`          | Prod badge text                              |
| developmentText    | string   | `DEV`           | Dev badge text                               |
| stagingText        | string   | `STAGING`       | Staging badge text                           |
| testText           | string   | `TEST`          | Test badge text                              |
| position           | string   | `bottom-right`   | Badge position (`top-right`, `top-left`, `bottom-right`, `bottom-left`) |
| size               | string   | `medium`         | Badge size (`small`, `medium`, `large`)      |
| autoDetectEnv      | boolean  | `true`           | Try to detect environment automatically      |
| forceEnv           | string   |                 | Force environment (`production`, `development`, `staging`, `test`) |
| enabled            | boolean  | `true`           | Show/hide the flag                           |
| debug              | boolean  | `false`          | Enable debug logs                            |

## 🧑‍💻 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📄 License

ISC

---

Made with ❤️ by Koray TUNCER 