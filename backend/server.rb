require 'bundler/setup'
Bundler.require
require 'sinatra'
require 'sinatra/cors'
require 'json'
require 'dotenv'
require 'quill-sql'

Dotenv.load(File.expand_path('../.env', __dir__))
#print out the environment variables
ENV.each do |k, v|
  if k == 'PRIVATE_KEY' || k == 'DB_URL'
    puts "#{k}: #{v}"
  end
end

set :port, 3001
set :bind, '0.0.0.0'

configure do
  enable :cors
  set :allow_methods, 'GET,POST,OPTIONS'
  set :allow_origin, '*'
  set :allow_headers, 'Content-Type, Authorization'
end

quill = Quill.new(
  private_key: ENV['PRIVATE_KEY'] || '',
  database_connection_string: ENV['DB_URL'] || '',
  database_config: {},
  database_type: 'clickhouse'
)

get '/' do
  'Hello World!'
end

post '/quill' do
  content_type :json
  headers 'Access-Control-Allow-Origin' => '*'
  metadata = JSON.parse(request.body.read)['metadata']
  result = quill.query(
  tenants: [
    {
      'tenant_field' => 'client_group_id',
      'tenant_ids' => ['d08218d5-5ce3-4e2d-af6a-05e130e62730']
    }
  ],
  metadata: metadata
)
result.to_json
end

get '/quill-report/:report_id' do 
  content_type :json
  headers 'Access-Control-Allow-Origin' => '*'
  report_id = params['report_id']
  result = quill.query(
  tenants: [
    {
      'tenant_field' => 'client_group_id',
      'tenant_ids' => ['d08218d5-5ce3-4e2d-af6a-05e130e62730']
    }
  ],
  metadata: {
    "reportId": report_id,
    "clientId": ENV['NEXT_PUBLIC_QUILL_PUBLIC_KEY'],
    "task": "report",
    "filters": []
  }
)

data = result[:data]
queries = result[:queries]
rows = queries[:queryResults][0][:rows]

response_object = {
  rows: rows,
  name:    data[:name],
  columns: data[:columns]
}

response_object.to_json
end

options '/quill' do
  response.headers["Allow"] = "GET,POST,OPTIONS"
  response.headers["Access-Control-Allow-Origin"] = "*"
  response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
  200
end
