## Document

Render backend doc overview

```bash
# build
npx @compodoc/compodoc -p tsconfig.json

# build & serve
npx @compodoc/compodoc -p tsconfig.json -s
```

## Hướng dẫn dành cho dev

1. Config

- Chỉ đổi config trong file môi trường .env.*

2. Standard code

- **Bắt buộc** tuân theo quy tắc eslint trong file .eslintrc.js
- Tuyệt đối **không** chỉnh sửa libs core, nếu có lỗi vui lòng báo luôn cho mình để fix
- Không update file package-lock.json tránh ảnh hưởng đến production
- Sử dụng yarn add/install tại local
- Không cần thiết import các module global (đã khai báo trong app.module)
- Khi import > 3 items thì cho thành dạng nhiều dòng
- Exception message viết bằng tiếng Việt
- Viết TODO theo mẫu: `// TODO: Nội dung cần làm`
  _ Sử dụng tệp index.ts của mỗi module để tổng hợp các export ra bên ngoài như Module, Service, Enum, …
- Sử dụng 01 tệp .dto cho mỗi entity

3. Công việc khi hoàn thành nhánh

- Viết API doc
- Cập nhật Changelog

4. Logger

- debug: Debug dữ liệu để kiểm tra
- Info: Các trạng thái, thông tin thông thường
- Warn: Lỗi nghiệp vụ (business) đã xác định
- Error: Lỗi ngoại lệ không mong muốn (exception)

5. Commit

- Cú pháp:

```
<mã usecase> <kiểu> ([<các thành phần tác động> - không bắt buộc]): <mô tả ngắn bằng tiếng Việt>
<mô tả dài nếu cần thiết>
```

Ví dụ:

```
3.3 feature (auth): Các tính năng về xác thực tài khoản
0 refactor: Tái cấu trúc thư mục toàn bộ source
```

- Các kiểu:

+ Tính năng

```
feature: Hoàn tất tính năng mới (hoặc) rebase
improve: Hoàn tất cải tiến, thay đổi sau khi tính năng đã thực hiện (hoặc) rebase
```

+ Commit thường: mức ưu tiên giảm dần

```
refactor: Tái cấu trúc code, phân cấp thư mục mang tính chất thay đổi lớn
fixbug: Sửa lỗi
imple: Bắt đầu / Đang thực hiện tính năng, thay đổi, bổ sung, tạo doc, test
```

6. Đặt tên

- Quy tắc chung:

+ camelCase: tênBiến, tênHàm
+ PascalCase: ClassName, EnumValue
+ snake_case: tên_thư_mục
+ kebab-case: tên-tệp
+ UPPER_CASE: HẰNG_SỐ

- Biến `boolean`:

+ Thêm các từ `is, are, has, does` phía trước

- Private

+ Có thể thêm `_` phía trước camelCase chỉ thị private trong class

## Command

- Nest

```bash
nest new my-project
nest g resource company --no-spec
nest g app my-app
nest g controller my-app
nest g module my-app
nest g service my-app
nest g library my-library
nest build my-library

```

- Yarn

```bash
yarn add package
yarn remove package
```

- Command git submodule

```bash
git submodule add <remote_url> <destination_folder>
git submodule update --init --recursive
git submodule update --remote --merge
```
