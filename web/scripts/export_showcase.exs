# Writes the flows of the showcase gallery to src/data/showcase/flows.json.
#
# Each flow is built here in the format Heddle saves, checked with the same
# validator the server runs before it saves one, and written out with the
# definitions of the nodes it uses, so the page draws them the way the editor does.
#
# Run it from the Heddle repository, next to this one:
#
#     cd ../heddle && mix run --no-start ../web/scripts/export_showcase.exs
#
# The labels and notes here are the English ones. The page translates them with
# `showcase.flows` in src/i18n/.

defmodule Showcase.Build do
  # One column of the canvas, and the middle row a flow runs along.
  @column 180
  @middle 150

  def node(id, type, label, {column, row}, controls) do
    %{
      "id" => id,
      "type" => type,
      "label" => label,
      "controls" => controls,
      "position" => %{"x" => column * @column, "y" => @middle + row}
    }
  end

  def wire(source, output, target) do
    %{"source" => source, "sourceOutput" => output, "target" => target, "targetInput" => "exec"}
  end

  def note(id, text, {x, y}, color \\ "yellow") do
    %{
      "id" => id,
      "kind" => "note",
      "color" => color,
      "text" => text,
      "width" => 240,
      "height" => 140,
      "position" => %{"x" => x, "y" => y}
    }
  end

  def code(id, label, at, elixir) do
    node(id, "Evaluate Code", label, at, %{
      "language" => "elixir",
      "code_elixir" => String.trim(elixir),
      "code_python" => ""
    })
  end

  # A credential is picked from the ones saved in Heddle, so a shared flow has none.
  def service(id, type, label, at, controls), do: node(id, type, label, at, Map.put(controls, "credential", ""))
end

defmodule Showcase.Flows do
  import Showcase.Build

  def all, do: [leads(), sales_report(), support(), refunds(), uptime(), orders()]

  # A form sends a lead. The flow looks its company up, scores it and sends it to
  # the right place, then answers the form.
  def leads do
    %{
      "id" => "leads",
      "nodes" => [
        node("form", "Webhook", "Form sent", {0, 0}, %{"method" => "POST", "path" => "/leads"}),
        code("keep", "Keep the lead", {1, 0}, ~S"""
        Map.put(context, "lead", context["body"])
        """),
        node("lookup", "HTTP Request", "Look up the company", {2, 0}, %{
          "method" => "GET",
          "url" => "https://api.github.com/orgs/{{lead.github_org}}",
          "headers" => ~s({"Accept": "application/vnd.github+json"}),
          "body" => ""
        }),
        code("score", "Score it", {3, 0}, ~S"""
        tier =
          cond do
            result["followers"] >= 1_000 -> "hot"
            result["public_repos"] >= 20 -> "warm"
            true -> "cold"
          end

        Map.put(context, "result", %{
          "company" => result["name"],
          "followers" => result["followers"],
          "tier" => tier
        })
        """),
        node("route", "Switch", "Route by tier", {4, 0}, %{
          "switch_value" => "{{result.tier}}",
          "case_1" => "hot",
          "case_2" => "warm",
          "case_3" => "",
          "case_4" => ""
        }),
        service("sales", "Slack: Send Message", "Tell sales", {5, -150}, %{
          "channel" => "#sales",
          "text" => "Hot lead: {{lead.name}} from {{result.company}}, {{result.followers}} followers on GitHub.",
          "thread_ts" => ""
        }),
        service("pipeline", "Google Sheets: Add Rows", "Add to the pipeline", {5, 0}, %{
          "spreadsheet_id" => "your-pipeline-spreadsheet-id",
          "range" => "Leads!A:D",
          "rows" => ~s([["{{lead.name}}", "{{lead.email}}", "{{result.company}}", "{{result.tier}}"]])
        }),
        service("welcome", "Email: Send Email", "Send the guides", {5, 150}, %{
          "to" => "{{lead.email}}",
          "cc" => "",
          "bcc" => "",
          "subject" => "Thanks for reaching out",
          "message" => "Hi {{lead.name}}, thanks for writing to us. While we read it, these guides are a good start: https://yourcompany.com/guides",
          "format" => "plain",
          "attachment_name" => "",
          "attachment" => ""
        }),
        node("join", "Merge", "Join", {6, 0}, %{"combine" => "list"}),
        node("answer", "Respond to Webhook", "Answer the form", {7, 0}, %{
          "response_status" => "200",
          "response_body" => ~s({"received": true})
        })
      ],
      "connections" => [
        wire("form", "exec", "keep"),
        wire("keep", "exec", "lookup"),
        wire("lookup", "success", "score"),
        wire("score", "exec", "route"),
        wire("route", "case 1", "sales"),
        wire("route", "case 2", "pipeline"),
        wire("route", "otherwise", "welcome"),
        wire("sales", "success", "join"),
        wire("pipeline", "success", "join"),
        wire("welcome", "success", "join"),
        wire("join", "exec", "answer")
      ],
      "comments" => [
        note("why-keep", "The HTTP Request has a body field of its own, which would hide the form's. So the lead is kept under another name first.", {150, -40})
      ]
    }
  end

  # Every weekday morning: yesterday's sales, summed up by an AI, in Slack and email.
  def sales_report do
    %{
      "id" => "sales-report",
      "nodes" => [
        node("morning", "Schedule", "Weekdays at 8", {0, 0}, %{"cron" => "0 8 * * 1-5"}),
        service("sales", "SQL: Run Query", "Yesterday's sales", {1, 0}, %{
          "sql" => """
          SELECT product, count(*) AS orders, sum(total) AS revenue
          FROM orders
          WHERE created_at >= current_date - 1 AND created_at < current_date
          GROUP BY product
          ORDER BY revenue DESC
          """
        }),
        service("summary", "AI: Summarize", "Sum it up", {2, 0}, %{
          "text" => "{{result.rows}}",
          "format" => "bullets",
          "model" => ""
        }),
        service("channel", "Slack: Send Message", "Post in #sales", {3, -90}, %{
          "channel" => "#sales",
          "text" => "Good morning! Yesterday's sales:\n{{result}}",
          "thread_ts" => ""
        }),
        service("leadership", "Email: Send Email", "Email leadership", {3, 90}, %{
          "to" => "leadership@yourcompany.com",
          "cc" => "",
          "bcc" => "",
          "subject" => "Yesterday's sales",
          "message" => "{{result}}",
          "format" => "plain",
          "attachment_name" => "",
          "attachment" => ""
        }),
        service("failed", "Slack: Send Message", "Tell ops it failed", {2, 210}, %{
          "channel" => "#ops",
          "text" => "The sales report couldn't read the database: {{result.error}}",
          "thread_ts" => ""
        })
      ],
      "connections" => [
        wire("morning", "exec", "sales"),
        wire("sales", "success", "summary"),
        wire("sales", "error", "failed"),
        wire("summary", "success", "channel"),
        wire("summary", "success", "leadership")
      ],
      "comments" => [
        note("bound", "The query runs as it is written. Values from a run would go in as bound parameters, never as text.", {120, -60}, "blue")
      ]
    }
  end

  # A help desk sends each new ticket. An AI sorts it, and each kind goes to the
  # people who handle it. Questions get a first answer right away.
  def support do
    %{
      "id" => "support",
      "nodes" => [
        node("ticket", "Webhook", "New ticket", {0, 0}, %{"method" => "POST", "path" => "/tickets"}),
        service("sort", "AI: Classify", "Sort it", {1, 0}, %{
          "text" => "{{body.subject}}\n\n{{body.message}}",
          "categories" => "bug, billing, question",
          "model" => ""
        }),
        node("route", "Switch", "Route by kind", {2, 0}, %{
          "switch_value" => "{{result.category}}",
          "case_1" => "bug",
          "case_2" => "billing",
          "case_3" => "",
          "case_4" => ""
        }),
        service("engineering", "Slack: Send Message", "Tell engineering", {3, -150}, %{
          "channel" => "#bugs",
          "text" => "New bug from {{body.email}}: {{body.subject}}\n> {{body.message}}",
          "thread_ts" => ""
        }),
        service("billing", "Email: Send Email", "Forward to billing", {3, 0}, %{
          "to" => "billing@yourcompany.com",
          "cc" => "",
          "bcc" => "",
          "subject" => "Billing: {{body.subject}}",
          "message" => "From {{body.email}}:\n\n{{body.message}}",
          "format" => "plain",
          "attachment_name" => "",
          "attachment" => ""
        }),
        service("draft", "AI Agent", "Write an answer", {3, 150}, %{
          "prompt" => "Answer this question from a customer:\n\n{{body.message}}",
          "system" => "You answer for the support team. Be brief and kind, and say a person will follow up if the answer isn't enough.",
          "output" => "text",
          "memory_key" => "",
          "temperature" => "0.2",
          "model" => "",
          "max_steps" => ""
        }),
        service("reply", "Email: Send Email", "Reply to the customer", {4, 150}, %{
          "to" => "{{body.email}}",
          "cc" => "support@yourcompany.com",
          "bcc" => "",
          "subject" => "Re: {{body.subject}}",
          "message" => "{{result}}",
          "format" => "plain",
          "attachment_name" => "",
          "attachment" => ""
        }),
        node("join", "Merge", "Join", {5, 0}, %{"combine" => "list"}),
        node("answer", "Respond to Webhook", "Tell the help desk", {6, 0}, %{
          "response_status" => "200",
          "response_body" => ~s({"handled": true})
        })
      ],
      "connections" => [
        wire("ticket", "exec", "sort"),
        wire("sort", "success", "route"),
        wire("route", "case 1", "engineering"),
        wire("route", "case 2", "billing"),
        wire("route", "otherwise", "draft"),
        wire("draft", "success", "reply"),
        wire("engineering", "success", "join"),
        wire("billing", "success", "join"),
        wire("reply", "success", "join"),
        wire("join", "exec", "answer")
      ],
      "comments" => [
        note("copy", "The answer goes out with support in copy, so a person sees every one.", {860, 290}, "green")
      ]
    }
  end

  # A refund waits for someone in finance to approve it. Nobody approving in two
  # days is an answer too.
  def refunds do
    %{
      "id" => "refunds",
      "nodes" => [
        node("request", "Webhook", "Refund requested", {0, 0}, %{"method" => "POST", "path" => "/refunds"}),
        code("keep", "Keep the request", {1, 0}, ~S"""
        Map.put(context, "refund", context["body"])
        """),
        service("ask", "Email: Send Email", "Ask finance", {2, 0}, %{
          "to" => "finance@yourcompany.com",
          "cc" => "",
          "bcc" => "",
          "subject" => "Approve a refund of {{refund.amount}} on order {{refund.order_id}}?",
          "message" => "{{refund.customer}} asked for a refund of {{refund.amount}} on order {{refund.order_id}}.\n\nReason: {{refund.reason}}\n\nTo approve it, open {{resume_url}}",
          "format" => "plain",
          "attachment_name" => "",
          "attachment" => ""
        }),
        node("approval", "Wait", "Wait for approval", {3, 0}, %{
          "wait_for" => "call",
          "amount" => "2",
          "unit" => "days",
          "wait_until" => ""
        }),
        node("pay", "HTTP Request", "Refund the order", {4, -80}, %{
          "method" => "POST",
          "url" => "https://api.yourshop.com/orders/{{refund.order_id}}/refunds",
          "headers" => ~s({"Content-Type": "application/json"}),
          "body" => ~s({"amount": "{{refund.amount}}", "reason": "{{refund.reason}}"})
        }),
        service("customer", "Email: Send Email", "Tell the customer", {5, -80}, %{
          "to" => "{{refund.email}}",
          "cc" => "",
          "bcc" => "",
          "subject" => "Your refund is on its way",
          "message" => "Hi {{refund.customer}}, we refunded {{refund.amount}} on order {{refund.order_id}}. It takes a few days to show up.",
          "format" => "plain",
          "attachment_name" => "",
          "attachment" => ""
        }),
        service("expired", "Slack: Send Message", "Nobody approved it", {4, 120}, %{
          "channel" => "#finance",
          "text" => "The refund for order {{refund.order_id}} waited two days. Is someone looking at it?",
          "thread_ts" => ""
        })
      ],
      "connections" => [
        wire("request", "exec", "keep"),
        wire("keep", "exec", "ask"),
        wire("ask", "success", "approval"),
        wire("approval", "exec", "pay"),
        wire("approval", "timeout", "expired"),
        wire("pay", "success", "customer")
      ],
      "comments" => [
        note("resume", "{{resume_url}} resumes this run. The wait is saved, so it survives a restart of the server.", {500, -110})
      ]
    }
  end

  # Checks a site every five minutes, and alerts once when it has been down for
  # three checks in a row.
  def uptime do
    %{
      "id" => "uptime",
      "nodes" => [
        node("every", "Schedule", "Every 5 minutes", {0, 0}, %{"cron" => "*/5 * * * *"}),
        node("check", "HTTP Request", "Check the site", {1, 0}, %{
          "method" => "GET",
          "url" => "https://yourcompany.com/health",
          "headers" => "{}",
          "body" => ""
        }),
        service("clear", "Redis: Delete Keys", "Forget the failures", {2, -90}, %{"keys" => "uptime:failures"}),
        service("count", "Redis: Increment", "Count the failure", {2, 90}, %{"key" => "uptime:failures", "amount" => "1"}),
        node("third", "Switch", "Third in a row?", {3, 90}, %{
          "switch_value" => "{{result.value}}",
          "case_1" => "3",
          "case_2" => "",
          "case_3" => "",
          "case_4" => ""
        }),
        service("alert", "Slack: Send Message", "Alert on-call", {4, 90}, %{
          "channel" => "#on-call",
          "text" => "yourcompany.com has been down for 15 minutes: {{result.error}}",
          "thread_ts" => ""
        })
      ],
      "connections" => [
        wire("every", "exec", "check"),
        wire("check", "success", "clear"),
        wire("check", "error", "count"),
        wire("count", "success", "third"),
        wire("third", "case 1", "alert")
      ],
      "comments" => [
        note("once", "Only the third failure alerts. The fourth goes on counting quietly, until the site is back.", {500, -60}, "blue")
      ]
    }
  end

  # A shop sends each order. Every item takes stock off, and the customer gets
  # a confirmation once all of them are done.
  def orders do
    %{
      "id" => "orders",
      "nodes" => [
        node("order", "Webhook", "New order", {0, 0}, %{"method" => "POST", "path" => "/orders"}),
        code("keep", "Keep the order", {1, 0}, ~S"""
        Map.put(context, "order", context["body"])
        """),
        node("each", "For Each", "Each item", {2, 0}, %{"items" => "order.line_items"}),
        service("stock", "SQL: Run Query", "Take it from stock", {3, -90}, %{
          "sql" => "UPDATE products SET stock = stock - {{item.quantity}} WHERE sku = {{item.sku}}"
        }),
        service("confirm", "Email: Send Email", "Confirm the order", {3, 90}, %{
          "to" => "{{order.email}}",
          "cc" => "",
          "bcc" => "",
          "subject" => "Order {{order.id}} confirmed",
          "message" => "Thanks, {{order.customer}}! Your order {{order.id}} is confirmed, and we'll write again when it ships.",
          "format" => "plain",
          "attachment_name" => "",
          "attachment" => ""
        }),
        node("answer", "Respond to Webhook", "Answer the shop", {4, 90}, %{
          "response_status" => "200",
          "response_body" => ~s({"order": "{{order.id}}", "status": "confirmed"})
        })
      ],
      "connections" => [
        wire("order", "exec", "keep"),
        wire("keep", "exec", "each"),
        wire("each", "item", "stock"),
        wire("each", "done", "confirm"),
        wire("confirm", "success", "answer")
      ],
      "comments" => [
        note("bound", "{{item.quantity}} and {{item.sku}} go to the database as bound parameters, never pasted into the SQL.", {720, -60}, "blue")
      ]
    }
  end
end

defmodule Showcase.Export do
  alias HeddleCore.Flows.GraphValidator
  alias HeddleNodes.Nodes

  def run(flows) do
    Enum.each(flows, &check!/1)

    data = %{
      heddle_version: Application.spec(:heddle_nodes, :vsn) |> to_string(),
      definitions: definitions(flows),
      flows: flows
    }

    path = Path.join([__DIR__, "..", "src", "data", "showcase", "flows.json"])
    File.mkdir_p!(Path.dirname(path))
    File.write!(path, Jason.encode_to_iodata!(data, pretty: true))
    IO.puts("#{length(flows)} flows -> #{Path.expand(path)}")
  end

  # What the server checks before it saves a flow, and that every node exists.
  defp check!(flow) do
    with :ok <- GraphValidator.validate(flow["nodes"], flow["connections"], manifest: HeddleNodes),
         :ok <- GraphValidator.validate_comments(flow["comments"]) do
      for node <- flow["nodes"], is_nil(Nodes.get_node(node["type"])) do
        raise "#{flow["id"]}: there is no #{node["type"]} node"
      end

      :ok
    else
      error -> raise "#{flow["id"]} is not a valid flow: #{inspect(error)}"
    end
  end

  defp definitions(flows) do
    types = flows |> Enum.flat_map(& &1["nodes"]) |> MapSet.new(& &1["type"])

    Nodes.all_nodes()
    |> Enum.filter(&MapSet.member?(types, &1.name))
    |> Map.new(fn node ->
      {node.name,
       %{
         name: node.name,
         category: node.category,
         icon: node.icon,
         description: node[:description],
         inputs: node.inputs,
         outputs: node.outputs,
         ui_fields: Enum.map(node.ui_fields, &Map.take(&1, [:type, :name, :label, :options, :default, :render, :language]))
       }}
    end)
  end
end

Application.ensure_all_started(:heddle_nodes)
Showcase.Export.run(Showcase.Flows.all())
