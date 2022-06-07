# areas-routing
複数地点を経由する最短経路を計算するプログラムです。

Google Map APIを利用して計算をしているので、使用する場合はGoogle Map APIのアカウントとAPIキーを取得してください。
14行目のYOURKEYを取得したAPIキーに置き換えてください。

現状経由する地点は最大20地点としていますが、routing.js内のplusArea関数の2行目、area_num > 20 の20を変更すると最大地点数を変更できます。
大きくするほど使用するメモリと時間がかかるので注意してください。

Web上で実際に動かせるものは http://www.rhindcormo.com/portfolio/short_route.html にあります。
