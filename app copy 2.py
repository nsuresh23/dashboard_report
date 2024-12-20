#app.py
from flask import Flask, render_template, jsonify, request
import numpy as np
import pandas as pd

from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Access environment variables
# app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
# app.config['DATABASE_URI'] = os.getenv('DATABASE_URI')  # Example for database connection

# Load the data from the dynamic Excel source
def load_data():
    file_path = r"dashboard.xlsx"  # Path to your dynamic Excel file
    df = pd.read_excel(file_path, sheet_name="Load")
    df.columns = df.columns.str.lower().str.replace(" ", "_").str.replace("\n", "", regex=False)
    
    # Replace NaN values with appropriate defaults based on data types
    for col in df.columns:
        if pd.api.types.is_object_dtype(df[col]):
            df[col] = df[col].fillna("")  # Default to empty string for other data types
        elif pd.api.types.is_string_dtype(df[col]):
            df[col] = df[col].fillna("")  # Replace NaN with empty string for string columns
        elif pd.api.types.is_datetime64_any_dtype(df[col]) or pd.api.types.is_timedelta64_dtype(df[col]):
            df[col] = df[col].fillna(pd.NaT)  # Replace NaN with NaT for datetime/timedelta columns
        else:
            df[col] = df[col].fillna(0)  # Replace NaN with 0 for numeric columns
    return df

def format_date_column(df):
    # Check if the 'date' column is already a datetime object, if not, convert it to datetime
    df["date"] = pd.to_datetime(df["date"], errors='coerce')

    # Apply formatting for valid dates and replace NaT with an empty string
    df["date"] = df["date"].apply(
        lambda x: x.strftime("%d-%m-%Y") if pd.notna(x) else ""
    )
    return df

# Convert int64 and NaT values to serializable formats
def convert_to_serializable(obj):
    if isinstance(obj, np.int64):
        obj = int(obj)
    elif isinstance(obj, np.int64):
        obj = float(obj)
    elif isinstance(obj, pd.Timestamp) and pd.isna(obj):
        obj = None
    else:
        obj = str(obj)
    return obj

# Helper function to convert pandas DataFrame to JSON-serializable dictionary
def format_to_serializable(df):
    df = df.applymap(convert_to_serializable)
    return df

# Calculate total time taken as timedelta
def calculate_total_time_taken(df):
    # Convert 'Time Taken' to timedelta and coerce errors to NaT
    time_taken = pd.to_timedelta(df["time_taken"], errors="coerce")
    time_taken = time_taken.apply(
        lambda x: x if (x != 0 and x != "" and pd.notna(x)) else pd.Timedelta(0)
    )
    total_time = time_taken.sum()
    # Extract days, hours, minutes, and seconds from total_time
    days = total_time.days
    hours, remainder = divmod(total_time.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)

    total_time_taken = {"days": days, "hours": hours, "minutes": minutes, "seconds": seconds}
    return total_time_taken

def get_total_summary(df):
    # Summary cards data
    total_summary = {}
    total_summary["total_batches"] = df["batch_name"].nunique()
    total_summary["total_lines"] = int(df["count_of_lines_in_batch_file"].sum())
    total_summary["total_success"] = int(df["successful_count"].sum())
    total_summary["total_failures"] = int(df["failure_count"].sum())
    total_time_taken = calculate_total_time_taken(df)
    total_summary["total_time_taken"] = total_time_taken
    total_time_str = f"{total_time_taken.get('days')} days {total_time_taken.get('hours')} hours {total_time_taken.get('minutes')} minutes {total_time_taken.get('seconds')} seconds"
    total_summary["total_time_taken_str"] = total_time_str
    return total_summary

@app.route("/")
def index():
    return render_template(
        "dashboard.html",
    )
    
@app.route('/filter-data', methods=['POST'])
def get_filter_data():
    
    df = load_data()
    
    # Prepare the data to send to the client
    # response_data = df.to_dict(orient='records')
    serialized_df = format_to_serializable(df)
    response_data = serialized_df.to_dict(orient='records')
    return jsonify(response_data)


@app.route('/get-data', methods=['POST'])
def get_data():
    start_date = request.form.get('start_date')
    end_date = request.form.get('end_date')
    status = request.form.get('status')

    # Convert string dates to datetime objects
    start_date = pd.to_datetime(start_date)
    end_date = pd.to_datetime(end_date)
    
    df = load_data()
    
    total_summary = get_total_summary(df)
    df = format_date_column(df)

    # Filter DataFrame based on the date range and status
    # filtered_df = df[(df['date'] >= start_date) & (df['date'] <= end_date)]
    filtered_df = df
    if status:
        filtered_df = filtered_df[filtered_df['status'] == status]
        
    # Convert non-serializable types to native Python types
    # filtered_df = filtered_df.where(pd.notnull(filtered_df), None)  # Replace NaN/NaT with None
    # filtered_df = filtered_df.astype(object).where(filtered_df.notnull(), None)  # Handle numeric types

    # Prepare data to send
    # report_data = filtered_df.to_dict(orient='records')
    serialized_filtered_df = format_to_serializable(filtered_df)
    report_data = serialized_filtered_df.to_dict(orient='records')
    
    # Combine data into a single dictionary
    response_data = {
        "totals": total_summary,
        "data": report_data,
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
