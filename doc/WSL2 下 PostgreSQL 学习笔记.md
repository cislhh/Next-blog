# 📝 WSL2 下 PostgreSQL 学习笔记

## 1. 安装 PostgreSQL

- 更新系统包索引：

    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

- 安装 PostgreSQL：

    ```bash
    sudo apt install postgresql postgresql-contrib -y
    ```

- 检查服务状态：

    ```bash
    sudo service postgresql status
    ```

    > 注意：`postgresql.service` 是 umbrella 服务，真正的实例是 `postgresql@<版本>-main`。

---

## 2. 基础配置

- 切换到 postgres 系统用户：

    ```bash
    sudo -i -u postgres
    ```

- 进入数据库命令行：

    ```bash
    psql
    ```

- 创建数据库和用户：

    ```sql
    CREATE DATABASE mydb;
    CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword';
    GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
    ```

- 退出 psql：

    ```sql
    \q
    ```

---

## 3. 配置文件

- 配置文件路径：`/etc/postgresql/<版本号>/main/postgresql.conf`
- 常见配置：

    ```
    listen_addresses = 'localhost'   # 或 '*' 允许外部访问
    port = 5432                      # 默认端口
    ```

- 修改后重启服务：

    ```bash
    sudo service postgresql restart
    ```

- 用户认证文件：`/etc/postgresql/<版本号>/main/pg_hba.conf` 修改为：

    ```
    local   all   all   md5
    ```

---

## 4. 常见问题解决

- **active (exited)**：这是正常的 umbrella 服务状态，实例服务才是真正运行。
- **浏览器无法访问 5432**：PostgreSQL 是数据库服务，不是 HTTP 服务，需用 `psql` 或 DBeaver 等工具连接。
- **忘记数据库名/用户**：在 psql 中查询：

    ```sql
    \l   -- 列出所有数据库
    \du  -- 列出所有用户
    ```

- **忘记密码**：在 psql 中重置：

    ```sql
    ALTER USER myuser WITH PASSWORD 'newpassword';
    ```

---

## 5. 使用 DBeaver 连接

1. 打开 DBeaver，新建连接 → PostgreSQL。
2. 填写：
    - Host: `localhost`
    - Port: `5432`
    - Database: `mydb`
    - Username: `myuser`
    - Password: `mypassword`
3. 测试连接 → 成功后保存。

---

## 6. 快速命令查询表格

| 场景               | 命令                                                 |
| ------------------ | ---------------------------------------------------- |
| 查看所有数据库     | `\l`                                                 |
| 查看所有用户       | `\du`                                                |
| 查看当前数据库     | `\conninfo`                                          |
| 创建新数据库       | `CREATE DATABASE newdb;`                             |
| 创建新用户         | `CREATE USER newuser WITH ENCRYPTED PASSWORD 'pwd';` |
| 授权用户访问数据库 | `GRANT ALL PRIVILEGES ON DATABASE newdb TO newuser;` |
| 修改用户密码       | `ALTER USER myuser WITH PASSWORD 'newpassword';`     |
| 查看端口号         | `SHOW port;`                                         |
| 查看监听地址       | `SHOW listen_addresses;`                             |
| 修改配置文件路径   | `/etc/postgresql/<版本>/main/postgresql.conf`        |
| 重启服务           | `sudo service postgresql restart`                    |
| 验证服务           | `sudo service postgresql status`                       |

---

