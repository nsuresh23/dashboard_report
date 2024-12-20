#app.py
from flask import Flask, render_template, jsonify, request
import pandas as pd
from datetime import datetime, timedelta

app = Flask(__name__)

# Load the data from the dynamic Excel source
def load_data():
    file_path = r"dashboard.xlsx"  # Path to your dynamic Excel file
    df = pd.read_excel(file_path, sheet_name="Load")
    df.fillna("", inplace=True)  # Replace NaN values for easier handling
    
    # Convert columns to numeric, string, timedelta coercing errors to NaN
    df["Count of Lines in \nBatch File"] = pd.to_numeric(df["Count of Lines in \nBatch File"], errors='coerce')
    df["Successful Count"] = pd.to_numeric(df["Successful Count"], errors='coerce')
    df["Failure Count"] = pd.to_numeric(df["Failure Count"], errors='coerce')
    
    return df

def filter_nat(df):
    # Convert NaT in datetime/timedelta columns to strings
    for col in df.select_dtypes(include=['datetime64', 'timedelta64']):
        df[col] = df[col].apply(lambda x: x.isoformat() if pd.notna(x) else None)
    return df

# Calculate total time taken as timedelta
def calculate_total_time_taken(df):
    # Convert 'Time Taken' to timedelta and coerce errors to NaT
    time_taken = pd.to_timedelta(df["Time Taken"], errors='coerce')
    time_taken = time_taken.fillna(pd.Timedelta(0))
    total_time_taken = time_taken.sum()
    return str(total_time_taken)

def get_total_summary(df):
    # Summary cards data
    total_summary = {}
    total_summary["total_batches"] = df["Batch Name"].nunique()
    total_summary["total_lines"] = df["Count of Lines in \nBatch File"].sum()
    total_summary["total_success"] = df["Successful Count"].sum()
    total_summary["total_failures"] = df["Failure Count"].sum()
    total_summary["total_time_taken"] = calculate_total_time_taken(df)
    return total_summary

@app.route("/")
def index():
    return render_template(
        "dashboard.html",
    )
    
@app.route('/filter-data', methods=['POST'])
def get_filter_data():
    
    df = load_data()
    
    df = filter_nat(df)

    # Prepare the data to send to the client
    response_data = df.to_dict(orient='records')
    return jsonify(response_data)


@app.route('/chart-data', methods=['POST'])
def get_chart_data():
    start_date = request.form.get('start_date')
    end_date = request.form.get('end_date')
    status = request.form.get('status')

    # Convert string dates to datetime objects
    start_date = pd.to_datetime(start_date)
    end_date = pd.to_datetime(end_date)
    
    df = load_data()
    
    df = filter_nat(df)
    
    total_summary = get_total_summary(df)

    # Filter DataFrame based on the date range and status
    filtered_df = df[(df['Date'] >= start_date) & (df['Date'] <= end_date)]
    if status:
        filtered_df = filtered_df[filtered_df['Status'] == status]
        
    # Convert non-serializable types to native Python types
    # filtered_df = filtered_df.applymap(lambda x: x.item() if isinstance(x, (pd.Int64Dtype, pd.Float64Dtype, pd.Timestamp)) else x)
    
    # filtered_df = filtered_df.convert_dtypes()
    
    # filtered_df = filtered_df.where(pd.notnull(filtered_df), None)

    # Prepare data to send
    report_data = filtered_df.to_dict(orient='records')
    # additional_data = {
    #     "start_date": start_date.strftime('%Y-%m-%d'),
    #     "end_date": end_date.strftime('%Y-%m-%d'),
    #     "status": status,
    # }
    
    # Combine data into a single dictionary
    response_data = {
        "totals": total_summary,
        "report": report_data,
        # "additional_info": additional_data
    }

    return jsonify(response_data)

# @app.route("/chart-data")
# def chart_data():
#     df = load_data()
#     # Convert NaT in datetime/timedelta columns to strings
#     for col in df.select_dtypes(include=['datetime64', 'timedelta64']):
#         df[col] = df[col].apply(lambda x: x.isoformat() if pd.notna(x) else None)
#     data = df.to_dict(orient="records")
#     return jsonify(data)

# @app.route("/line-chart-data")
# def line_chart_data():
#     df = load_data()
#     for col in df.select_dtypes(include=['datetime64', 'timedelta64']):
#         df[col] = df[col].apply(lambda x: x.isoformat() if pd.notna(x) else None)
#     return jsonify(df.to_dict(orient="records"))

if __name__ == "__main__":
    app.config['DEBUG'] = True
    app.run(debug=True)
